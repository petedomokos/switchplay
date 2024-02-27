import React, { useRef, useEffect, useState } from 'react';
import * as d3 from 'd3';
import { Icon } from 'react-icons-kit';
import { chevronRight } from 'react-icons-kit/feather/chevronRight';

import Container from '../../../common/components/UI/ContainerTwo';
import Text from '../../../common/components/Text';
import Heading from '../../../common/components/Heading';
import NextImage from '../../../common/components/NextImage';
import Link from '../../../common/components/Link';
import spectrumComponent from '../../../../core/spectrumComponent';
import { grey10 } from '../../../../core/websiteConstants';

import SectionWrapper, {
  Section,
  Content,
  Illustration,
} from './customer.style';
import illustration from '../../../common/assets/image/agencyModern/customer.png';
import colors from "../../../common/theme/agencyModern/colors";
import SVGImage from "../../../../core/SVGImage";

const Customer = ({ data, screen, direction, minHeight }) => {
  const [spectrum, setSpectrum] = useState(() => spectrumComponent());
  const spectrumContainerRef = useRef(null);

  const alignVertically = direction.includes("column");
  const spectrumWidth = alignVertically ? d3.min([500, screen.width * 0.8]) : screen.width * 0.6;
  const spectrumHeight = minHeight || (alignVertically ? 300 : 300);

  const requiredImgAspectRatio = 0.6;
  //@todo - pass the 70% and 75% trhough to stylesheet as props rather than hardcoding it here and there separately
  const requiredImgWidth = screen.isLarge ? screen.width * 0.7 : screen.width;
  const requiredImgHeight = requiredImgWidth * requiredImgAspectRatio ;
  const requiredImgDimns = { width: requiredImgWidth, height: requiredImgHeight }

  const { key, visual, heading, desc } = data;
  const { url, imgWidth, imgHeight, imgTransX=0, imgTransY=0 } = visual;

  const imgScale = imgWidth ? requiredImgDimns.width / imgWidth : 1;
  const transform = `translate(${imgTransX},${imgTransY}) scale(${imgScale})`;

  useEffect(() => {
    if(visual?.type !== "d3"){ return; }
    d3.select(spectrumContainerRef.current)
        //.datum({})
        .call(spectrum
            .width(spectrumWidth)
            .height(spectrumHeight)
            .margin({ 
              left: alignVertically ? 0 * spectrumWidth : (direction === "row" ? 0 : 0.3 * spectrumWidth), 
              right:alignVertically ? 0 * spectrumWidth : (direction === "row-reverse" ? 0 : 0.3 * spectrumWidth), 
              top: alignVertically ? 0 * spectrumHeight : 0, 
              bottom: alignVertically ? 0 * spectrumHeight : 0.3 * spectrumHeight, 
            })
            .styles({
              waveColor:grey10(3),
              eyeStroke:grey10(2),
              barStroke:grey10(2),
              fusedStroke:grey10(2),
            }))
  }, [spectrumWidth, spectrumHeight])

  return (
    <SectionWrapper id="customer">
        <Section className={`${direction}`}>
          {visual?.type === "img" ? 
            <div style={{ width:`${requiredImgWidth}px`, height:`${requiredImgHeight}px` }}>
              <SVGImage image={{ url, transform, aspectRatio:requiredImgAspectRatio }} dimns={requiredImgDimns} imgKey={key} />
            </div>
            :
            <div className="visual-container" style={{ 
              width:`${spectrumWidth}px`, height:`${spectrumHeight}px`, overflow:"hidden" }} >
              {/**<svg ref={spectrumContainerRef} style={{ width:`${spectrumWidth}px`, height:`200px`, overflow:"hidden" }}></svg>*/}
              <img src="website/data-display/eye_transparent.png" style={{ objectFit:"contain" }}/>
            </div>
          }
          <Content>
            <div>
              {typeof heading !== "string" && 
                <>
                  <div style={{ width:"100%", height:"20px" }}></div>
                  <Heading
                    as="h3"
                    content={heading[0] || ""}
                  />
                  <Heading
                    as="h3"
                    content={heading[1] || ""}
                  />
                   <div style={{ width:"100%", height:"20px" }}></div>
                </>
              }
            </div>
            <Text content={desc || ""}/>
            {/**<Link className="explore" href="#">
              Explore more <Icon icon={chevronRight} />
            </Link>*/}
          </Content>
        </Section>
    </SectionWrapper>
  );
};

Customer.defaultProps = {
  direction:"row"
}

export default Customer;
