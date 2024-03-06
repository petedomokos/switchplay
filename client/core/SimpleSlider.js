import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import SVGImage from "./SVGImage";
import { grey10 } from "./websiteConstants";

const spectrumImages = {
  eye:{
    url:"website/about-page-images/slides/head.png",
    rawImgWidth:935,
    rawImgHeight:598,
    //scale:1.7,
    //imgTransX:-screen.width / 5,
    //aspectRatio:0.9
  },
  chart:{
    url:"website/about-page-images/slides/head.png",
    rawImgWidth:935,
    rawImgHeight:598,
    //scale:1.7,
    //imgTransX:-screen.width / 5,
    //aspectRatio:0.9
  },
  confused:{
    url:"website/about-page-images/slides/head.png",
    rawImgWidth:935,
    rawImgHeight:598,
    //scale:1.7,
    //imgTransX:-screen.width / 5,
    //aspectRatio:0.9
  }
};

const SpectrumViz = ({ }) => {
  return(
    <div>

    </div>
  )
} 

const SwitchplayApp = ({ dimns }) => {
  //const { width, height } = dimns;
  const containerRef = useRef(null);

  useEffect(() => {
    const containerDimns = containerRef?.current?.getBoundingClientRect() || { width:0, height:0 };
    const { width, height } = containerDimns;
    const strokeWidth = 1;
    const rectWidth = height * 0.7;
    const rectHeight = height;
    //space for stroke to show
    const rectContentsWidth = rectWidth - 2 * strokeWidth;
    const rectContentsHeight = rectHeight - 2 * strokeWidth;

    const cont = d3.select(containerRef.current);
    const g = cont.selectAll("g").data([1]);
    g.enter()
      .append("g")
      .each(function(){
        const g = d3.select(this);
        g.append("rect")
          .attr("rx", 15)
          .attr("ry", 15)
          .attr("stroke", grey10(6))
          .attr("stroke-width", strokeWidth)
          .attr("fill", "none")

        g.append("text")
          .attr("text-anchor", "middle")
          .attr("dominant-baseline", "central")
          .attr("stroke", grey10(6))
          .attr("fill", grey10(6))
          .attr("stroke-width", 0.2)
          .attr("font-size", 14)
          .text("SWITCHPLAY")
      })
      .merge(g)
      .attr("transform", `translate(${width/2}, 0)`)
      .each(function(){
        const g = d3.select(this)

        g.select("rect")
          .attr("x", strokeWidth - rectContentsWidth/2)
          .attr("y", strokeWidth)
          .attr("width", rectContentsWidth)
          .attr("height", rectContentsHeight)
          
        g.select("text")
          .attr("y", height/2)
      })

    g.exit().remove();
      
  })
  return (
    <svg width="100%" height="100%" ref={containerRef}>
    </svg>
  )

}



const Slide = ({ i, slide, classes, onClick }) => 
  <div className={classes.slideContainer} key={`slide-${i}`}>
    <div className={classes.slide} onClick={() => onClick(i)}>
      <div className={classes.slideImgOuterContainer} style={{ height:`${100 - slide.pcHeightForText}%` }}>
        <div className={classes.slideImgInnerContainer}>
          {slide.image && <SVGImage imgKey={`slide-img-${i}`} image={slide.image} contentFit="contain" />}
          {/**slide.key === "spectrum" && <SpectrumViz />*/}
          {slide.key === "switchplay_app" && <SwitchplayApp />}
        </div>
      </div>
      <div className={classes.slideParagraphs} style={{ height:`${slide.pcHeightForText}%` }}>
        {slide.text.map((para,i) => 
          <p className={classes.slideParagraph} key={`slide-para-${i}`}>
            {para}
          </p>
        )}
      </div>    
    </div>
  </div>

function SimpleSlider({ data, classes }) {
  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    adaptiveHeight:true,
    //dotsClass:"slick-dots"
    //className:"slider"
  };
  let sliderRef = useRef(null);

  const onClick = i => {
    if(i < data.length-1){
      sliderRef.slickNext();
    }
  }
  return (
    <div className={classes.sliderContainer}>
      <Slider {...settings} ref={slider => { sliderRef = slider; }}>
        {data.map((slide,i) => 
          <Slide key={`slide-${i}`} i={i} slide={slide} classes={classes} onClick={onClick} />
        )}
      </Slider>
    </div>
  );
}

export default SimpleSlider;