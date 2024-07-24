import React from 'react'
import '../../style/components/header/people.css';

const People = ({ people, screen }) => {
  console.log("people", people)
  const getClassname = i => {
    if(i === 0){
      return `profile-picture first ${screen.isSmall ? "first-sm-down" : "first-md-up"} `
    }
    if(i === 1){
      return `profile-picture second ${screen.isSmall ? "second-sm-down" : "second-md-up"} `
    }
    return `profile-picture third ${screen.isSmall ? "third-sm-down" : "third-md-up"} `
  }
  return (
    <div className='profile-picture-wrapper'>
      {people.map((p,i) => 
        <img src={p} key={`prof-${i}`} alt="Person Profile" className={getClassname(i)} />
      )}
    </div>
  );
};

People.defaultProps = {
  screen:{},
  people:[]
}
export default People;
