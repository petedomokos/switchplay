export const getKpis = (userId) => {
   if(!userId){
      return userKpis["mock"];
   }
   return userKpis[userId];
}

const userKpis = {
   "mock":[
      //note - stat is the new name for measure
      //press-ups in 1 min
      { 
         datasetId: "606b6aef720202523cc3589d", 
         statId: "606b6aef720202523cc3589e",
      },
      { 
         datasetId: "606b6aef720202523cc3589d", 
         statId: "606b6aef720202523cc3589e",
      },
      { 
         datasetId: "606b6aef720202523cc3589d", 
         statId: "606b6aef720202523cc3589e",
      },
      { 
         datasetId: "606b6aef720202523cc3589d", 
         statId: "606b6aef720202523cc3589e",
      },
      { 
         datasetId: "606b6aef720202523cc3589d", 
         statId: "606b6aef720202523cc3589e",
      },
      { 
         datasetId: "606b6aef720202523cc3589d", 
         statId: "606b6aef720202523cc3589e",
      },
      { 
         datasetId: "606b6aef720202523cc3589d", 
         statId: "606b6aef720202523cc3589e",
      },
      { 
         datasetId: "606b6aef720202523cc3589d", 
         statId: "606b6aef720202523cc3589e",
      }
   ]
}
