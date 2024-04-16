import serviceIcon1 from '../../assets/image/agencyModern/services/1.png';
import serviceIcon2 from '../../assets/image/agencyModern/services/2.png';
import serviceIcon3 from '../../assets/image/agencyModern/services/3.png';
import featureIcon1 from '../../assets/image/agencyModern/features/1.png';
import featureIcon2 from '../../assets/image/agencyModern/features/2.png';
import featureIcon3 from '../../assets/image/agencyModern/features/3.png';
import featureIcon4 from '../../assets/image/agencyModern/features/4.png';
import featureIcon5 from '../../assets/image/agencyModern/features/5.png';
import featureIcon6 from '../../assets/image/agencyModern/features/6.png';
import news1 from '../../assets/image/agencyModern/news/1.png';
import news2 from '../../assets/image/agencyModern/news/2.png';
import news3 from '../../assets/image/agencyModern/news/3.png';
import facebook from '../../assets/image/agencyModern/icons/facebook.png';
import dribbble from '../../assets/image/agencyModern/icons/dribbble.png';
import github from '../../assets/image/agencyModern/icons/github.png';
import twitter from '../../assets/image/agencyModern/icons/twitter.png';
import { NAVBAR_HEIGHT }  from "../../../../core/websiteConstants";

const data = {
  leftMenuItems: [
    {
      label: 'Home',
      id:"home",
      path: '#home',
      page:"home",
      offset: `${NAVBAR_HEIGHT}`,
      itemType:"anchor-link",
      whenToShow:["visitor"],
      asIcon:true
    },
    {
      label: 'Players',
      id: 'services',
      path: '#services',
      page:"home",
      offset: `${NAVBAR_HEIGHT}`,
      itemType:"anchor-link",
      whenToShow:["visitor"]
    },
    {
      label: 'Workflow',
      id: 'features',
      path: '#features',
      page:"home",
      offset: `${NAVBAR_HEIGHT}`,
      itemType:"anchor-link",
      whenToShow:["visitor"]
    },
    {
      label: 'Data',
      id: 'customer',
      path: '#customer',
      page:"home",
      offset: `${NAVBAR_HEIGHT}`,
      itemType:"anchor-link",
      whenToShow:["visitor"]
    },
  ],
  rightMenuItems: [
    {
      label: 'About',
      id: 'about-us',
      path: '/about',
      page:"about",
      offset: `${NAVBAR_HEIGHT}`,
      itemType:"page-link",
      whenToShow:["visitor"]
    },
    {
      label: 'Contact',
      id: 'contact',
      path: '/contact',
      page:"contact",
      offset: `${NAVBAR_HEIGHT}`,
      itemType:"page-link",
      whenToShow:["visitor"]
    },
    {
      label: 'Login',
      id:"login",
      path: '/signin',
      page:"login",
      offset: `${NAVBAR_HEIGHT}`,
      itemType:"page-link",
      whenToShow:["visitor"]
    },
    {
      label: 'Logout',
      id:"logout",
      path: '/signout',
      page:"login",
      offset: `${NAVBAR_HEIGHT}`,
      itemType:"click-button",
      withButtonBg:false,
      whenToShow:["all-users"]
    },
    {
      label: 'Get Demo',
      id: 'demo',
      path: '/demo',
      page:"demo",
      width:135,
      offset: `${NAVBAR_HEIGHT}`,
      itemType:"click-button",
      withButtonBg:true,
      whenToShow:["visitor"]
    },
  ],
  mobileMenuItems: [
    {
      isMobile:true,
      label: 'Home',
      id:"home",
      path: '#home',
      page:"home",
      offset: `${NAVBAR_HEIGHT}`,
      itemType:"anchor-link",
      whenToShow:["visitor"]
    },
    {
      isMobile:true,
      label: 'Your Players',
      id: 'services',
      path: '#services',
      page:"home",
      offset: `${NAVBAR_HEIGHT}`,
      itemType:"anchor-link",
      whenToShow:["visitor"]
    },
    {
      isMobile:true,
      label: 'Your Workflow',
      id: 'features',
      path: '#features',
      page:"home",
      offset: `${NAVBAR_HEIGHT}`,
      itemType:"anchor-link",
      whenToShow:["visitor"]
    },
    {
      isMobile:true,
      label: 'Data',
      id:"customer",
      path: '#customer',
      page:"home",
      offset: `${NAVBAR_HEIGHT}`,
      itemType:"anchor-link",
      whenToShow:["visitor"]
    },
    {
      isMobile:true,
      label: 'About',
      id: 'about-us',
      path: '/about',
      page:"about",
      isPage:true,
      offset: `${NAVBAR_HEIGHT}`,
      itemType:"page-link",
      whenToShow:["visitor"]
    },
    {
      isMobile:true,
      label: 'Contact',
      id: 'contact',
      path: '/contact',
      page:"contact",
      offset: `${NAVBAR_HEIGHT}`,
      itemType:"page-link",
      whenToShow:["visitor"]
    },
    {
      isMobile:true,
      label: 'Login',
      id: 'login',
      path: '/signin',
      page:"login",
      isPage:true,
      offset: `${NAVBAR_HEIGHT}`,
      itemType:"page-link",
      whenToShow:["visitor"]
    },
    {
      isMobile:true,
      label: 'Logout',
      id:"logout",
      path: '/signout',
      offset: `${NAVBAR_HEIGHT}`,
      itemType:"click-button",
      withButtonBg:false,
      whenToShow:["all-users"]
    },
    {
      isMobile:true,
      label: 'Request Demo',
      id: 'demo',
      path: '/demo',
      page:"demo",
      width:165,
      height:35,
      offset: `${NAVBAR_HEIGHT}`,
      itemType:"click-button",
      withButtonBg:true,
      whenToShow:["visitor"]
    }
  ],
  services: [
    [
      {
        id: 1,
        icon: serviceIcon1,
        key:"accountability",
        title: 'Being Accountable',
        description:"Our exclusive data visuals engage teenage players and nurture an accountabilty mindset. You can set visible goals that won't get forgotten, with clear criteria for success that players can easily track.",
        //description: `Switchplay gives you an engaging way to nuture an accountability mindset in your players. You can set visible goals that won't get forgotten, with clear criteria for success that players can easily track`,
        image:{
          type:"svg",
          rawImgWidth:3000,
          rawImgHeight:3000, 
          imgTransX:0, 
          imgTransY:0,
          aspectRatio:1
        }
      }
    ],
    [
      {
        id: 2,
        icon: serviceIcon2,
        key:"thinking",
        title: 'Reflective Thinking',
        description:"We improve the quality of discussion in post-match reviews. We get players thinking and reflecting in new ways as they watch their minutes and relate it to their data and goals.",
        //description:"Are your players good learners? Switchplay supports you to transform match reviews and discussions about data and videos into a trully valuable learning experience.",
        //description:`Switchplay simplifies your online comms with players, parents and staff. You can easily engage players and get them thinking about a video review or a tactical point. `,
        image:{
          type:"svg",
          /*rawImgWidth:50, 
          rawImgHeight:50, 
          imgTransX:0, 
          imgTransY:0,*/
          rawImgWidth:20,
          rawImgHeight:20, 
          imgTransX:-55, 
          imgTransY:-40,
          aspectRatio:1
        }
        /*
        image:{
          type:"png",
          transform:"translate(0px,7px) scale(1.5)"
        }
        */
      },
      {
        id: 3,
        icon: serviceIcon3,
        key:"communication",
        title: 'Proactive Communication',
        description: `You probably have 1 or 2 players who are more proactive than the rest in finding out what they need to do to improve. Switchplay changes the team culture, turning that 1 or 2 into 11 or 12.`,
        //These days, your messages have to compete with all the noise in players’ lives: opinions on social media, the emotions of a game, and all the rest.
        image:{
          type:"svg",
          rawImgWidth:1000, 
          rawImgHeight:1000, 
          imgTransX:-20, 
          imgTransY:-10,
          aspectRatio:1
        }
        /*image:{
          type:"png",
          transform:"scale(1)"
        }*/
      },
    ]
  ],
  accordion: [
    {
      id: 1,
      expend: true,
      title: 'Organize your project content',
      description: `Proper Content Management is important to find out the real clients for your agencies.A day to day report about your ongoing business for proper understanding.`,
    },
    {
      id: 2,
      title: 'Collaborate your documents easily',
      description: `Some hardworking People are Working Day and Night to provide you highly scalable product that supplies best design system guidelines ever.`,
    },
    {
      id: 3,
      title: "Build your team's knowledge base",
      description: `We respect our customer opinions and deals with them with perfect wireframing.A day to day report about your ongoing business for proper understanding.`,
    },
  ],
  WorkHardList: [
    { id: 1, title: 'Medical and vision' },
    { id: 2, title: 'Life insurance' },
    { id: 3, title: '400(k) savings' },
    { id: 4, title: 'HSAs and FSAs' },
    { id: 5, title: 'Commuter benefits' },
    { id: 6, title: '529 college savings' },
  ],
  features: [
    {
      id: 1,
      icon: featureIcon1,
      title: 'User-Friendly',
      desc: 'No more clicking on all those menus and pages. Switchplay\'s unique view is intuitive and easy to use. It joins up all the pieces of info into a coherent whole.',
    },
    {
      id: 2,
      icon: featureIcon2,
      title: 'Customisable',
      desc: 'Switchplay can be adapted for your processes. The interface can be completely customised to support you to get the outcomes that matter to you.',
    },
    {
      id: 3,
      icon: featureIcon3,
      title: 'Integrated',
      desc: 'Instead of having to use lots of apps and web pages, Switchplay integrates these so you can do everything from one place on any device.',
    },
  ],
  posts: [
    {
      id: 1,
      icon: news1,
      title: 'How to work with prototype design with adobe xd featuring tools',
      comments_count: 22,
    },
    {
      id: 2,
      icon: news2,
      title: 'Create multiple artboard by using figma prototyping development',
      comments_count: 15,
    },
    {
      id: 3,
      icon: news3,
      title: 'Convert your web layout theming easily with sketch zeplin extension',
      comments_count: 18,
    },
  ],
  aboutUs: [
    {
      id: 1,
      title: 'Support Center',
    },
    {
      id: 2,
      title: 'Customer Support',
    },
    {
      id: 3,
      title: 'About Us',
    },
    {
      id: 4,
      title: 'Copyright',
    },
  ],
  ourInformation: [
    {
      id: 1,
      title: 'Return Policy',
    },
    {
      id: 2,
      title: 'Privacy Policy',
    },
    {
      id: 3,
      title: 'Terms & Conditions',
    },
    {
      id: 4,
      title: 'Site Map',
    },
  ],
  myAccount: [
    {
      id: 1,
      title: 'Press inquiries',
    },
    {
      id: 2,
      title: 'Social media',
    },
    {
      id: 3,
      title: 'directories',
    },
    {
      id: 4,
      title: 'Images & B-roll',
    },
  ],
  social: [
    {
      id: 1,
      icon: facebook,
      title: 'Facebook',
    },
    {
      id: 2,
      icon: twitter,
      title: 'Twitter',
    },
    {
      id: 3,
      icon: github,
      title: 'Github',
    },
    {
      id: 4,
      icon: dribbble,
      title: 'Dribbble',
    },
  ],
};
export default data;
