export const mockData = () => {
    const nodes = mockNodes();
    const links = mockLinks();
    return { nodes, links };
}

const mockNodes = () => {
    return [
        { id:"0", name:"Sites" },
        { id:"1", name:"Maintanence", data:[1, 2, 3] },
        { id:"2", name:"Salaries", data:[8, 9, 10] },
        { id: "3", name:"Rent", data:100 },
        { id: "4", name:"Sum of Maint", data:"sum" },
        { id:"5", name:"Sum of Sal", data:"sum" },
        { id:"6", name:"Total Cost", data:"sum" }
    ];
}

const mockLinks = () => {
    return [
        { id:"0-1", src:"0", targ:"1"},
        { id:"0-2", src:"0", targ:"2"},
        { id:"0-3", src:"0", targ:"3"},
        { id:"1-4", src:"1", targ:"4"},
        { id:"2-5", src:"2", targ:"5"},
        { id:"3-6", src:"3", targ:"6"},
        { id:"4-6", src:"4", targ:"6"},
        { id:"5-6", src:"5", targ:"6"}
    ];
}