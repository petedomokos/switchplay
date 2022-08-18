import barChartLayout from "./barChartLayout";

export default function quadrantBarChartLayout(){

    function layout(data){
        return {
            ...data,
            quadrantsData:data.quadrantsData.map((q,i) => {
                const layout = barChartLayout()
                    .order(i % 2 === 0 ? "ascending" : "descending");

                return layout(q);
            })
        }
    }

    return layout;

}