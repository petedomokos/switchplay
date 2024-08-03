import React from 'react'
import '../../style/components/header/people.css';

const People = ({ people, screen }) => {
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
        <div className={getClassname(i)} key={`prof-${i}`}>
          {
            p.profilePhoto ? 
              <img src={p.profilePhoto} alt="Person Profile" />
              :
              <div style={{ 
                  width:"30px", height:"30px", borderRadius:"100%", background:"#DAA520", 
                  display:"flex", justifyContent:"center", alignItems:"center",
                  fontSize:"14px", opacity:0.75
                }}>{p.initials}
              </div>
          }
        </div>
      )}
    </div>
  );
};

People.defaultProps = {
  screen:{},
  people:[]
}
export default People;
