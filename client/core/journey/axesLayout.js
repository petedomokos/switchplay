import { OPEN_CHANNEL_EXT_WIDTH } from './constants';
import * as d3 from 'd3';

export default function axesLayout(){
    //note channels are the visible channels on screen
    function update(channels){
        const openChannels = channels.filter(ch => ch.isOpen);
        const lastChannel = channels[channels.length -1];

        //add the first channel to all open channels to get axis ds. 
        //Note if first channel open, then this channel creates two axis ds
        const firstAxisDatum = {
            key:"main",
            startDate:channels[0].startDate,
            endDate:openChannels[0]?.startDate || lastChannel.endDate,
            transX:0,
            showStartVerticalMark:true,
            showEndVerticalMark:openChannels.length === 0
        }
        const otherAxesData = openChannels.map((ch, i) => {
            //helpers
            const nextOpenChannel = channel => openChannels.find(ch => ch.nr > channel.nr);
            const isLastAxis = channel => !!nextOpenChannel(channel)
            return {
                key:"open-"+ch.nr,
                //all open channels create an axis from its end point
                startDate:ch.endDate,
                endDate:nextOpenChannel(ch)?.startDate || lastChannel.endDate,
                //each prev open ch crates a horiz shift, and so does this one
                transX:(ch.nrPrevOpenChannels + 1) * ch.scaledExtWidth,
                showStartVerticalMark:false,
                showEndVerticalMark:isLastAxis(ch),
            }
        })

        return [firstAxisDatum, ...otherAxesData];

    }

    return update;
}