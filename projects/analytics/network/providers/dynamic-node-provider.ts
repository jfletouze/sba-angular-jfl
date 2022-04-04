import { Query } from '@sinequa/core/app-utils';
import { Record } from '@sinequa/core/web-services';
import { NodeType, Node, NetworkProvider, NetworkDataset } from '../network-models';
import { RecordsProvider, StructuralEdgeType, RecordNode } from './records-provider';
import { Utils } from '@sinequa/core/base';
import { combineLatest } from 'rxjs';
import { Action } from '@sinequa/components/action';

/**
 * Extension of the NodeType interface with additional properties specific
 * to dynamic nodes, in particular the getQuery() function that returns a
 * query given a node
 */
export interface DynamicNodeType extends NodeType {
    /** Returns a query object to execute to obtain a record for this node */
    getQuery: (node: Node) => Query|undefined;
    /** Defines when the query should be executed. Warning: oninsert may generate multiple simultaneous queries */
    trigger: "oninsert" | "onclick" | "manual";
}

/**
 * An extension of the RecordsProvider which manages dynamic node types.
 * Dynamic nodes are nodes that are transformed into record nodes via a
 * query. The records are fetched from the server dynamic to enrich the
 * original node.
 * For example, a simple metadata node with the value "Bill Gates" can be
 * enriched with the wikipedia page of Bill Gate, which can provide a lot
 * of structured information about Bill Gates (which can be used, for
 * example, to attach structural edges to the original Bill Gates node).
 * Note that the "source node" have to come from different providers, so it is
 * necessary to listen to these providers and update the data generated by this
 * provider accordingly.
 */
export class DynamicNodeProvider extends RecordsProvider {

    /** List of the source nodes that have been already processed via clicks or actions */
    protected processedNodes: string[] = [];
    /** to avoid fetching the same data multiple times, we store the record objects fetched from the server in this cache */
    protected nodeCache = new Map<string, Record>();

    constructor(
        public override name: string,
        protected override nodeType: DynamicNodeType,
        protected override edgeTypes: StructuralEdgeType[],
        protected permanent: boolean,
        protected sourceProviders: NetworkProvider[]
    ){
        super(name, nodeType, edgeTypes, [], false);
        
        combineLatest(sourceProviders.map(p => p.getProvider())).subscribe(dataset => {
            if(this.active){
                // "Merge" the nodes from all datasets into a map
                const map = new Map<string, Node>();
                dataset.forEach(dataset => {
                    dataset.getNodes().forEach(node => {
                        if(node.visible && node.type === this.nodeType) {
                            map.set(node.id, node);
                        }
                    });
                });
                // Update the dataset of dynamic edges
                this.updateDynamicDataset(Array.from(map.values()));
            }
        });
    }

    /**
     * Rebuild the dataset of this provider given a list of source nodes to process
     * @param sourceNodes A list of source nodes to process
     */
    protected updateDynamicDataset(sourceNodes: Node[]) {
        
        // We rebuild the dataset from scratch, in case some source nodes were removed
        this.dataset = new NetworkDataset();

        // If oninsert, we want to process all the source nodes. If not, we want to process the nodes in the processedNodes list
        if(this.nodeType.trigger !== "oninsert") {
            this.processedNodes = this.processedNodes.filter(id => !!sourceNodes.find(node => node.id === id)); // We want to "forget" the nodes that are not in the source anymore
            sourceNodes = sourceNodes.filter(node => this.processedNodes.indexOf(node.id) !== -1); // We want to process only the nodes currently in the processed list
        }
        
        // For each source, we get its query
        const queries = sourceNodes.map(node => (this.nodeCache.has(node.id) || (node as RecordNode).record)? undefined : this.nodeType.getQuery(node));
        const _queries = queries.filter(q => !!q) as Query[];
        // If there are queries, we process them asynchronously
        if(_queries.length > 0) {
            this.context.searchService.getMultipleResults(_queries, undefined).subscribe(res => {
                this.mutateNodes(sourceNodes as RecordNode[], res.results.map(r => r.records.length > 0? r.records[0] : undefined), queries);
            });
        }
        else {
            this.mutateNodes(sourceNodes as RecordNode[], [], queries);
        }
    }

    /**
     * Processes a given node: If the record for this node is available
     * in the node cache, we take this record and mutate the node. If not,
     * we get the query via the dynamic node type's getQuery() function,
     * and mutate the node upon results.
     * @param node A source node to process
     */
    protected processNode(node: RecordNode) {
        if(!this.permanent) {
            this.dataset.clear(); // Remove data from previously clicked node
            this.processedNodes.splice(0); // Remove the processed nodes
        }

        this.processedNodes.push(node.id);
        if(this.nodeCache.has(node.id)) {
            this.mutateNode(node, this.nodeCache[node.id]);
            this.provider.next(this.dataset);
        }
        else {
            const query = this.nodeType.getQuery(node);
            if(query) {
                this.context.searchService.getResults(query, undefined, {searchInactive: true}).subscribe(results => {
                    if(results.records.length > 0) {
                        this.mutateNode(node, results.records[0]);
                    }
                    this.provider.next(this.dataset);
                });
            }
        }       
    }

    /**
     * Mutates a list of nodes, given a corresponding list of records
     * and of queries. Manages to get the record objects either from
     * these inputs or from the cache.
     * @param nodes The list of node to mutate
     * @param records The list of records for each node
     * @param queries The list of queries for each node
     */
    protected mutateNodes(nodes: RecordNode[], records: (Record|undefined)[], queries: (Query|undefined)[]) {
        let j = 0;
        for(let i = 0; i<nodes.length; i++){
            const node = nodes[i];
            const query = queries[i];
            let record: Record|undefined;
            if(query){
                record = records[j++];
            }
            else if(node.record) {
                record = node.record;
            }
            else if(this.nodeCache.has(node.id)){
                record = this.nodeCache[node.id];
            }

            if(record) {
                this.mutateNode(node, record);
            }
        }
        this.provider.next(this.dataset);
    }

    /**
     * Mutate a given node with the given record:
     * - Attaches the record property
     * - Increases the node precedence
     * - Updates the node cache
     * - Refresh the node's appearance (node options)
     * - Attaches the structural edges to this node
     * @param node The node to mutate
     * @param record The record used for mutation
     */
    protected mutateNode(node: RecordNode, record: Record) {
        node.record = record;
        node.precedence = 1; // Give more precedence to the new node (so it will prevail when merged with another node)
        this.nodeCache[node.id] = record;
        this.refreshNodeOptions(node); // The node might change appearance, since it has mutated into a record node
        this.edgeTypes.forEach(type => {
            this.addStructuralEdges(node, type);
        });
    }

    /**
     * (Re-)computes the node options of a node (after mutation)
     * @param node a node
     */
    protected refreshNodeOptions(node: Node) {
        let options;
        if(typeof this.nodeType.nodeOptions === "function") {
            options = this.nodeType.nodeOptions(node, this.nodeType);
        }
        else {
            options = this.nodeType.nodeOptions;
        }
        return Utils.extend(node, options);
    }
    
    // Network provider interface

    /**
     * Process a clicked node, for dynamic node types with an "onclick" trigger
     * @param node The clicked node
     */
    override onNodeClicked(node?: RecordNode) {
        super.onNodeClicked(node);
        if(this.active && this.nodeType.trigger === "onclick" && node && node.type === this.nodeType && this.processedNodes.indexOf(node.id) === -1) {
            this.processNode(node);
        }
    }

    /**
     * Creates an action to process a clicked node, for dynamic node types
     * with a "manual" trigger.
     * @param node The clicked node
     */
    override getNodeActions(node: RecordNode): Action[] {
        const actions = super.getNodeActions(node);
        if(this.active && this.nodeType.trigger === "manual" && node && node.type === this.nodeType && this.processedNodes.indexOf(node.id) === -1) {
            actions.unshift(new Action({
                icon: "fas fa-star-of-life",
                title: this.context.intlService.formatMessage("msg#network.actions.expandNode", {label: node.label}),
                action: () => {
                    this.processNode(node);
                }
            }));
        }
        return actions;
    }
}
