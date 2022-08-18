export const mockProfileData = {
    name:"Tolu Abbass",
    minScore:0, //todo - change it to see bars that reach a min threshold only
    maxScore:10,
    maxNrOfBars:10,
    quadrantsData:[
        {
            key:"technical",
            title:"Technical",
            barData:[
                { key:"shortPassingL", title:"Long Pass (Left)", value:6 },
                { key:"longPassingL", title:"Short Pass (Left)", value:7 },
                { key:"crossingL", title:"Cross (Left)", value:3 },
                { key:"shootingL", title:"Shoot (Left)", value:4 },
                { key:"shortPassingR", title:"Long Pass (Right)", value:6 },
                { key:"longPassingR", title:"Short Pass (Right)", value:7 },
                { key:"crossingR", title:"Cross (Right)", value:3 },
                { key:"shootingR", title:"Shoot (Right)", value:4 },
                { key:"touch", title:"Touch", value:6 },
                { key:"dribble", title:"Dribble", value:2 },
            ]
        },
        {
            key:"physical",
            title:"Physical",
            barData:[
                { key:"shortPassingL", title:"Long Pass (Left)", value:10 },
                { key:"longPassingL", title:"Short Pass (Left)", value:10 },
                { key:"crossingL", title:"Cross (Left)", value:8 },
                { key:"shootingL", title:"Shoot (Left)", value:7 },
                { key:"shortPassingR", title:"Long Pass (Right)", value:8 },
                { key:"longPassingR", title:"Short Pass (Right)", value:5 },
                { key:"crossingR", title:"Cross (Right)", value:6 },
                { key:"shootingR", title:"Shoot (Right)", value:8 },
                { key:"touch", title:"Touch", value:9 },
                { key:"dribble", title:"Dribble", value:4 },
            ]
        },
        {
            key:"psychological",
            title:"Psychological",
            barData:[
                { key:"shortPassingL", title:"Long Pass (Left)", value:0 },
                { key:"longPassingL", title:"Short Pass (Left)", value:3 },
                { key:"crossingL", title:"Cross (Left)", value:7 },
                { key:"shootingL", title:"Shoot (Left)", value:6 },
                { key:"shortPassingR", title:"Long Pass (Right)", value:3 },
                { key:"longPassingR", title:"Short Pass (Right)", value:0 },
                { key:"crossingR", title:"Cross (Right)", value:0 },
                { key:"shootingR", title:"Shoot (Right)", value:4 },
                { key:"touch", title:"Touch", value:6 },
                { key:"dribble", title:"Dribble", value:5 },
            ]
        },
        {
            key:"social",
            title:"Social",
            barData:[
                { key:"shortPassingL", title:"Long Pass (Left)", value:4 },
                { key:"longPassingL", title:"Short Pass (Left)", value:4 },
                { key:"crossingL", title:"Cross (Left)", value:5 },
                { key:"shootingL", title:"Shoot (Left)", value:0 },
                { key:"shortPassingR", title:"Long Pass (Right)", value:0 },
                { key:"longPassingR", title:"Short Pass (Right)", value:4 },
                { key:"crossingR", title:"Cross (Right)", value:4 },
                { key:"shootingR", title:"Shoot (Right)", value:6 },
                { key:"touch", title:"Touch", value:4 },
                { key:"dribble", title:"Dribble", value:0 },
            ]
        },
    ],
}