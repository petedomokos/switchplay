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

const Customer = ({ screen }) => {
  const [spectrum, setSpectrum] = useState(() => spectrumComponent());
  const spectrumContainerRef = useRef(null);

  const spectrumWidth = screen.width * 0.4;
  const spectrumHeight = 300;

  useEffect(() => {
    d3.select(spectrumContainerRef.current)
        //.datum({})
        .call(spectrum
            .width(spectrumWidth)
            .height(spectrumHeight)
            .margin({ left: spectrumWidth * 0.1, right:spectrumWidth * 0.25, top: spectrumHeight * 0.25, bottom: spectrumHeight * 0.1 }))
        
}, [spectrumWidth, spectrumHeight])

  return (
    <SectionWrapper id="customer">
      <Container>
        <Section>
          <div style={{
            width:`${spectrumWidth}px`, height:`${spectrumHeight}px`, background:"none", padding:"0", display:"flex", alignItems:"center", justifyContent:"center"
          }}>
              <svg ref={spectrumContainerRef}></svg>
          </div>
          {/**<Illustration><img src="website/logo.png" /></Illustration>*/}
          <Content>
            <Heading
              as="h2"
              content="Use data with confidence and purpose"
            />
            <Text content="Should you trust your 'coaches eye' more than data? Switchplay helps you find the balance through great collaboration between your analysts and coaches." />
            {/**<Link className="explore" href="#">
              Explore more <Icon icon={chevronRight} />
            </Link>*/}
          </Content>
        </Section>
      </Container>
    </SectionWrapper>
  );
};

export default Customer;
