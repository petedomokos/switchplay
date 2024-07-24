import React, { useRef, useEffect, useState } from 'react';
import * as d3 from 'd3';
import kpisComponent from '../../../../journey/kpis/kpisComponent';
import { grey10 } from '../../../constants';

import '../../style/components/stats.css';

function StatsList({ statsData, screen }) {
    const [stats, setStats] = useState(() => kpisComponent());
    const [dimns, setDimns] = useState({ width: d3.min([screen.width * 0.8, 550]), height: 30 + statsData.length * 80 })

    const statsRef = useRef(null);

    useEffect(() => {
        d3.select(statsRef.current).datum(statsData) 
    }, [statsData])

    useEffect(() => {
        d3.select(statsRef.current)
            .call(stats
                .displayFormat("stats")
                .withCtrls(false)
                .margin({ left: 0, right: 20, top: 20, bottom: 0 })
                .width(dimns.width)
                .height(dimns.height)
                .maxKpiHeight(null)
                .styles({ 
                    numberLabels:{ fontSize:12, transform:"rotate(-30)", fill:grey10(5) },
                    kpi:{
                        title:{
                            fill:grey10(7),
                            fontSize:screen.isSmall ? 10 : 12
                        }
                    }
                })) 
    })

    return (
        <div className="stats-list" style={{ width:`${dimns.width}px`, height:`${dimns.height}px`, overflow:"visible" }}>
            <svg className="stats-list-svg" width="100%" height="100%" ref={statsRef} style={{ overflow:"visible" }}></svg>
        </div>
    );
}

StatsList.defaultProps = {
}

export default StatsList;
