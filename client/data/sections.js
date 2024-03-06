
import * as d3 from 'd3';

const createDefaultSection = sectionNr => ({ 
	key:`section-${sectionNr}`, title:`Section ${sectionNr}`, initials:`S${sectionNr}`
})

//for each itemNr, if user has defined a section for the item, then use that, else use default
const NR_CARD_ITEMS = 5;
export const hydrateDeckSections = (sections=[]) => d3.range(NR_CARD_ITEMS)
	.map(i => sections[i] || createDefaultSection(i+1))
	.map((s,i) => ({ 
		...s,
		//default initials and nr if not defined
		initials:s.initials || s.title?.slice(0,2)?.toUpperCase(), 
		nr:i + 1, //nr always starts from 1, cannot be changed and persisted 
	}))