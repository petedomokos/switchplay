import React from 'react';
import Text from '../../../common/components/Text';
import Heading from '../../../common/components/Heading';
import SimpleFeatureBlock from '../../../common/components/SimpleFeatureBlock';
import SectionWrapper, { SectionHeader, ServiceWrapper } from './service.style';
import data from '../../../common/data/AgencyModern';
import SVGImage from "../../../../core/SVGImage";
//import { Fade } from 'react-awesome-reveal';
//<Fade direction='up' triggerOnce delay={100}></Fade>
//</Fade>

const Services = () => {
  return (
    <SectionWrapper>
        <ServiceWrapper>
          <div className="services">
            {data.services[0].map((item, index) => (
              <div className="service primary-service" key={`service-item-key-${index}-${item.key}`}>
                <SimpleFeatureBlock
                  key={`post_key-${index}`}
                  id={`post_id-${item.id}`}
                  className="service__item"
                  icon={
                    <div style={{ width:"100px", height:"100px", paddingTop:10 }}>
                      {item.image.type === "svg" ?
                        <SVGImage image={{ ...item.image, url:`website/icons/${item.key}.svg`}} />
                        :
                        <img
                          src={`website/icons/${item.key}.png`}
                          alt={`Blog Image ${item.id}`}
                          objectFit="cover"
                          style={{ transform:item.image.transform, padding:0, margin:0 }}
                        />
                      }
                    </div>
                  }
                  title={<Heading as="h4" content={item.title} />}
                  description={
                    <Text
                      content={item.description}
                    />
                  }
                />
              </div>
            ))}
          </div>
          <div className="services">
            {data.services[1].map((item, index) => (
              <div className="service secondary-service">
                <SimpleFeatureBlock
                  key={`post_key-${index}`}
                  id={`post_id-${item.id}`}
                  className="service__item"
                  icon={
                    <div style={{ width:"100px", height:"100px", paddingTop:10}}>
                      {item.image.type === "svg" ?
                        <SVGImage image={{ ...item.image, url:`website/icons/${item.key}.svg`}} />
                        :
                        <img
                          src={`website/icons/${item.key}.png`}
                          alt={`Blog Image ${item.id}`}
                          objectFit="cover"
                          style={{ transform:item.image.transform, padding:0, margin:0 }}
                        />
                      }
                    </div>
                  }
                  title={<Heading as="h4" content={item.title} />}
                  description={
                    <Text
                      content={item.description}
                    />
                  }
                />
              </div>
            ))}
          </div>
        </ServiceWrapper>
    </SectionWrapper>
  );
};

export default Services;
