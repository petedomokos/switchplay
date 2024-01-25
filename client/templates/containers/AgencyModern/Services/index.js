import React from 'react';
import Container from '../../../common/components/UI/ContainerTwo';
import NextImage from '../../../common/components/NextImage';
import Text from '../../../common/components/Text';
import Heading from '../../../common/components/Heading';
import FeatureBlock from '../../../common/components/FeatureBlock';
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
            <Heading content="Get your players thinking & acting like pros" />
            <Text content="Build an incredible workplace and grow your business with all-in-one platform with amazing contents." />
          </SectionHeader>
       
        <ServiceWrapper>
          {data.services.map((item, index) => (
              <FeatureBlock
                key={`post_key-${index}`}
                id={`post_id-${item.id}`}
                className="service__item"
                icon={
                  <NextImage
                    src={item.icon}
                    alt={`Blog Image ${item.id}`}
                    objectFit="cover"
                  />
                }
                iconPosition="left"
                title={<Heading as="h4" content={item.title} />}
                description={<Text content={item.description} />}
              />
          ))}
        </ServiceWrapper>
      </Container>
    </SectionWrapper>
  );
};

export default Services;
