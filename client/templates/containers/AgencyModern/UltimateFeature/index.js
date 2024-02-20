import React from 'react';
import PropTypes from 'prop-types';
import * as d3 from 'd3';

import FeatureBlock from '../../../common/components/FeatureBlock';
import Container from '../../../common/components/UI/ContainerTwo';
import Text from '../../../common/components/Text';
import Link from '../../../common/components/Link';
import NextImage from '../../../common/components/NextImage';
import Heading from '../../../common/components/Heading';
import SectionWrapper, {
  SectionTitle,
  FeatureWrapper,
} from './ultimateFeature.style';
import data from '../../../common/data/AgencyModern';
import WorkflowAnimation from "../../../../core/WorkflowAnimation";

//helper
const maximiseDimns = (maxWidth, maxHeight, aspectRatio) => {
  const _height = maxWidth * aspectRatio;
  if(_height <= maxHeight){
      return { width: maxWidth, height: _height };
  }
  return { width: maxHeight / aspectRatio, height: maxHeight }
} 

const UltimateFeature = ({ screen }) => {
  const animationAspectRatio = screen.orientation === "landscape" ? 0.7 : 1;
  const maxAnimationWidth = d3.min([screen.width * 0.8, 600]);
  //console.log("maxw", maxAnimationWidth)
  const maxAnimationHeight = screen.height * 0.6;
  const animationDimns = maximiseDimns(maxAnimationWidth, maxAnimationHeight, animationAspectRatio);

  console.log("feat", data.features)
  return (
    <SectionWrapper id="features">
      <Container>
        <div style={{ margin:`30px 0px 0px calc(50% - ${animationDimns.width/2}px)`, 
                      width:`${animationDimns.width}px`, height:`${animationDimns.height}px` }} >
          <WorkflowAnimation dimns={animationDimns} />
        </div>
        <SectionTitle>
          <Heading content="One user-friendly view" />
          <Heading content="centered on the player" />
        </SectionTitle>
        <FeatureWrapper>
          {data.features.map((feature, index) => (
            <FeatureBlock
              key={index}
              icon={<NextImage src={feature.icon} alt={feature.title} />}
              title={<Heading as="h4" content={feature.title} />}
              description={
                <React.Fragment>
                  <Text content={feature.desc} />
                  {/**<Link href="#" className="learn__more">
                    Learn More <Icon icon={chevronRight} />
                  </Link>*/}
                </React.Fragment>
              }
              className="ultimateFeature"
            />
          ))}
        </FeatureWrapper>
      </Container>
    </SectionWrapper>
  );
};

UltimateFeature.propTypes = {
  row: PropTypes.object,
  col: PropTypes.object,
};

UltimateFeature.defaultProps = {
  row: {
    flexBox: true,
    flexWrap: 'wrap',
    ml: ['-30px', '-30px', '-30px', '-25px', '-30px'],
    mr: ['-30px', '-30px', '-30px', '-25px', '-45px'],
  },
  col: {
    width: [1, 1 / 2, 1 / 2, 1 / 3],
  },
};

export default UltimateFeature;
