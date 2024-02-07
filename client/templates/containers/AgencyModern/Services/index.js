import React from 'react';
import Container from '../../../common/components/UI/ContainerTwo';
import NextImage from '../../../common/components/NextImage';
import Text from '../../../common/components/Text';
import Heading from '../../../common/components/Heading';
import SimpleFeatureBlock from '../../../common/components/SimpleFeatureBlock';
import SectionWrapper, { SectionHeader, ServiceWrapper } from './service.style';
import data from '../../../common/data/AgencyModern';
//import { Fade } from 'react-awesome-reveal';
//<Fade direction='up' triggerOnce delay={100}></Fade>
//</Fade>

const Services = () => {
  return (
    <SectionWrapper id="services">
      <Container>
        
          <SectionHeader>
            <Heading content="Get more of your players thinking like pros" />
            <Text content="Think of the most proactive player in your squad. Switchplay engages and inspires all players to become like them." />
          </SectionHeader>
       
        <ServiceWrapper>
          {data.services.map((item, index) => (
              <SimpleFeatureBlock
                key={`post_key-${index}`}
                id={`post_id-${item.id}`}
                className="service__item"
                icon={
                  <div style={{ width:"100px", height:"100px", paddingTop:10 }}>
                    <img
                      src={`website/icons/${item.key}.png`}
                      alt={`Blog Image ${item.id}`}
                      objectFit="cover"
                      style={{ transform:item.imageTransform, padding:0, margin:0 }}
                    />
                  </div>
                }
                title={<Heading as="h4" content={item.title} />}
              />
          ))}
        </ServiceWrapper>
      </Container>
    </SectionWrapper>
  );
};

export default Services;
