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

import SectionWrapper, {
  Section,
  Content,
  Illustration,
} from './customer.style';
import illustration from '../../../common/assets/image/agencyModern/customer.png';
import colors from "../../../common/theme/agencyModern/colors";
import SVGImage from "../../../../core/SVGImage";

const Customer = ({ data, screen, imgLocation, minHeight }) => {
  const [spectrum, setSpectrum] = useState(() => spectrumComponent());
  const spectrumContainerRef = useRef(null);

  const alignVertically = imgLocation === "bottom" || imgLocation === "top";
  const spectrumWidth = alignVertically ? d3.min([400, screen.width * 0.8]) : screen.width * 0.4;
  const spectrumHeight = minHeight || (alignVertically ? 260 : 300);

  const requiredImgAspectRatio = 0.6;
  //@todo - pass the 70% and 75% trhough to stylesheet as props rather than hardcoding it here and there separately
  const requiredImgWidth = spectrumWidth * 0.7;
  const requiredImgDimns = { width: requiredImgWidth, height: requiredImgWidth * requiredImgAspectRatio }


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
              left: alignVertically ? 0.15 * spectrumWidth : (imgLocation === "left" ? 0 : 0.3 * spectrumWidth), 
              right:alignVertically ? 0.15 * spectrumWidth : (imgLocation === "right" ? 0 : 0.3 * spectrumWidth), 
              top: alignVertically ? 0.15 * spectrumHeight : 0, 
              bottom: alignVertically ? 0.15 * spectrumHeight : 0.3 * spectrumHeight, 
            })
            .styles({
              waveColor:colors.linkColor
            }))
        
  }, [spectrumWidth, spectrumHeight])

  const singleLineHeading = typeof heading === "string" ? heading : heading.join(" ");

  return (
    <SectionWrapper id="customer">
      <Container>
        <Section>
          {(imgLocation === "top" || imgLocation === "left") &&
            <div className="visual-container" style={{ width:`${spectrumWidth}px`, height:`${spectrumHeight}px` }} >
                {visual?.type === "img" ? 
                  <div className={`img-container ${imgLocation}-img-container`} >
                    {/**<img src={data.visual.url} />*/}
                    <SVGImage image={{ url, transform }} dimns={requiredImgDimns} settings={{ withBorderGradient: false, borderWidth:10 }}
                        styles={{ borderColour:"#FF825C"}} imgKey={key} />
                  </div>
                  :
                  <svg ref={spectrumContainerRef}></svg>
                }
            </div>
          }
          {/**<Illustration><img src="website/logo.png" /></Illustration>*/}
          <Content>
            <div className={typeof heading === "string" ? "" : "md-down"}>
              <Heading
                as="h2"
                content={singleLineHeading || ""}
              />
            </div>
            <div className={typeof heading === "string" ? "" : "lg-up"}>
              {typeof heading !== "string" && 
                <>
                  <Heading
                    as="h3"
                    content={heading[0] || ""}
                  />
                  <Heading
                    as="h3"
                    content={heading[1] || ""}
                  />
                </>
              }
            </div>
            <Text content={desc || ""}/>
            {/**<Link className="explore" href="#">
              Explore more <Icon icon={chevronRight} />
            </Link>*/}
          </Content>
          {(imgLocation === "bottom" || imgLocation === "right") &&
            <div className="visual-container" style={{ width:`${spectrumWidth}px`, height:`${spectrumHeight}px` }} >
                {visual?.type === "img" ? 
                  <div className={`img-container ${imgLocation}-img-container`} >
                    {/**<img src={data.visual.url} />*/}
                    <SVGImage image={{ url, transform }} dimns={requiredImgDimns} settings={{ withBorderGradient: false, borderWidth:0 }}
                        styles={{ borderColour:"#FF825C"}} imgKey={key} />
                  </div>
                  :
                  <svg ref={spectrumContainerRef}></svg>
                }
            </div>
          }
        </Section>
      </Container>
    </SectionWrapper>
  );
};

export default Customer;
