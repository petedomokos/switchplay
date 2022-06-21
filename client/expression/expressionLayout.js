/* eslint-disable prefer-arrow-callback */
/* eslint-disable prefer-spread */
/* eslint-disable prefer-rest-params */
/* eslint-disable func-names */
/* eslint-disable prefer-const */

import * as d3 from 'd3';

/*
A higher-order function which returns data ready for the expression
*/
export default function expressionLayout() {
    //api
    let nodes = [];
    let links = [];
    //data returned
    let data = [];

    function update(expressionData = {}) {
        //console.log("update", expressionData)
        if(expressionData.nodes) { nodes = expressionData.nodes }
        if(expressionData.links) { links = expressionData.links }

        //helpers
        //these replace children and parents with the full up-to-date nodes from the nodes array
        const getParentNodes = nodes => node => {
            const fullNode = nodes.find(n => n.id === node.id);
            return fullNode?.parents?.map(p => nodes.find(n => n.id === p.id))
        }
        const getChildNodes = nodes => node => {
            const fullNode = nodes.find(n => n.id === node.id);
            //if fullNode has children, get the full children nodes
            return fullNode?.children?.map(ch => nodes.find(n => n.id === ch.id));
        }

        const nodesData = nodes.map(n => {
            const children = links
                .filter(l => l.src === n.id)
                .map(l => nodes.find(node => node.id === l.targ));
            const parentsArray = links
                .filter(l => l.targ === n.id)
                .map(l => nodes.find(node => node.id === l.src));
            const parents = parentsArray.length === 0 ? null : parentsArray;

            const nodeType = typeof n.data === "number" ? "value" : typeof n.data === "array" ? "dataset" : "func";

            return { ...n, children, parents, nodeType }

        })
        //add parents and children references
        .map((n,i, nodesArray) => ({
            ...n,
            children: n.children?.map(ch => nodesArray.find(n => n.id === ch.id)),
            parents: n.parents?.map(pa => nodesArray.find(n => n.id === pa.id)),
        }))
        //add depth and height
        .map((n, i, nodesArray) => {
            const depth = calcNodeDepth(n, getParentNodes(nodesArray));
            const height = calcNodeHeight(n, getChildNodes(nodesArray));

            //note - need depth of all parents to calc colnr so needs to be in next map after depth
            //const colNr = calcNodeColNr(n, nodesArray, getParentNodes(nodesArray));

            const descendants = () => getDescendants(n, getChildNodes(nodesArray));
            const ancestors = () => getAncestors(n, getParentNodes(nodesArray));
            const leaves = () => getLeaves(n, getChildNodes(nodesArray))

            return { ...n, depth, height, descendants, ancestors, leaves }
        })
        //add colNr
        .map((n,i, nodesArray) => ({
                ...n,
                colNr:calcNodeColNr(n, nodesArray, getParentNodes(nodesArray)),
                displayWidth:50,
                displayHeight:15
        }))
        //add funcs to get deep children and parents
        .map((n,i, nodesArray) => ({
            ...n,
            children: n.children?.map(ch => nodesArray.find(n => n.id === ch.id)),
            parents: n.parents?.map(pa => nodesArray.find(n => n.id === pa.id)),
            //deep versions - use these when you want to get children or parents with all their properties
            //including their own children and parents
            childNodes: () => getChildNodes(nodesArray),
            parentNodes: () => getParentNodes(nodesArray)
        }))

        const linksData = links.map(l => ({
            ...l,
            src:nodesData.find(n => n.id === l.src),
            targ:nodesData.find(n => n.id === l.targ)
        }))

        const root = nodesData.find(n => !n.parents)

        return { nodesData, linksData, root }
    }

    function getDescendants(node, childrenFunc = (n) => n.children){
        const getChildren = (node, accumulated) => {
            const children = childrenFunc(node);
            if(!children || children.length === 0){
                return accumulated;
            }else{
                const newAccumulated = [ ...accumulatedDescendants, ...children ];
                return node.children.reduce((a, b) => [...getChildren(a, newAccumulated), ...getChildren(b, newAccumulated)], []);
            }
        }
        return getChildren(node, []);
    }

    function getAncestors(node, parentsFunc = (n) => n.parents){
        //we use the getDescendents function but look for parents each time instead of children
        return getDescendants(node, parentsFunc)
    }

    function getLeaves(node, childrenFunc = (n) => n.children){
        //get all descendants then filter for only the leaves
        return getDescendants(node, childrenFunc)
            .filter(n => !n.children || n.children.length === 0);
    }

    function calcNodeHeight(node, childrenFunc = (n) => n.children){
        const checkChildren = (n, heightSoFar) => {
            const children = childrenFunc(n)
            if(!childrenFunc(n) || childrenFunc(n).length === 0){
                return heightSoFar;
            }
            return d3.max(children.map(ch => checkChildren(ch, heightSoFar + 1)));
        }
        return checkChildren(node, 0);
    }

    function calcNodeDepth(node, parentsFunc = (n) => n.parents){
        //we use the node height func but look for parents each time instead
        return calcNodeHeight(node, parentsFunc)
    }

    //may not be a whole number
    function calcNodeColNr(node, nodes, parentsFunc = (n) => n.parents){
        if(node.depth === 0){
            return node.colNr || 0; //root node may have been dragged out of col 0
        }
        if(node.depth === 1){
            //depth 1 nodes are each placed in new column by the order they appear in
            //if dragged, the order of them in state is changed
            const nodesIdsAtThisDepth = nodes.filter(n => n.depth === node.depth).map(n => n.id);
            return nodesIdsAtThisDepth.indexOf(node.id) + 1;
        }
        //rest of nodes are given an avg of their parent colNrs (unless they have been dragged to a particular spot)
        return node.colNr || d3.mean(parentsFunc(node), p => calcNodeColNr(p, nodes, parentsFunc));
    }

    // api
    update.nodes = function (value) {
        if (!arguments.length) { return nodes; }
        nodes = value;
        return update;
    };
    update.links = function (value) {
        if (!arguments.length) { return links; }
        links = value;
        return update;
    };
    return update;
}