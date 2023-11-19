import React, { } from 'react'
import { makeStyles } from '@material-ui/core/styles'

const pathD = "M10.5,4c-4.13029,0 -7.5,3.36971 -7.5,7.5c0,4.13029 3.36971,7.5 7.5,7.5c4.13029,0 7.5,-3.36971 7.5,-7.5c0,-0.16858 -0.01434,-0.33413 -0.02539,-0.5h2.58203c-0.20756,0.35549 -0.37621,0.73833 -0.4668,1.16211l-2.08008,9.7207c-1.579,-0.22 -4.75692,-0.65922 -6.04492,-0.82422c-0.027,-0.004 -0.58284,-0.05859 -0.96484,-0.05859c-4.073,0 -7.4435,3.059 -7.9375,7c-0.041,0.328 -0.0625,0.661 -0.0625,1c0,2.441 2.52452,14.795 2.97852,17h2.05469c-0.992,-5.11 -3.0332,-15.783 -3.0332,-17c0,-3.309 2.691,-6 6,-6c0.278,0 0.67889,0.03897 0.71289,0.04297c1.738,0.223 6.94041,0.94727 6.94141,0.94727c0.511,0.077 1.00623,-0.26925 1.11523,-0.78125l2.27344,-10.62891c0.231,-1.076 1.297,-1.76216 2.375,-1.53516c1.078,0.231 1.76811,1.297 1.53711,2.375l-3.21484,14.99414c-0.196,0.916 -1.01813,1.58203 -1.95312,1.58203c-0.083,0 -0.16677,-0.00558 -0.25977,-0.01758l-8.41406,-0.97266c-0.548,-0.065 -1.04442,0.33191 -1.10742,0.87891c-0.063,0.549 0.33091,1.04442 0.87891,1.10742l5.5293,0.64062l1.58008,14.36719h2.01172l-1.55078,-14.13086l0.83398,0.0957c2.061,0.255 3.97925,-1.13686 4.40625,-3.13086l3.21484,-14.99609c0.1353,-0.62976 0.09614,-1.25326 -0.05664,-1.83789h4.14648c0,0.51933 0.40158,0.93172 0.9082,0.98047l-4.17383,6.55859l-0.74219,3.46094h0.36133c0.342,0 0.65975,-0.17489 0.84375,-0.46289l6.06836,-9.53711h3.45703c0.10194,0.1756 0.18515,0.36247 0.23047,0.56641c0.115,0.521 0.02137,1.05781 -0.26562,1.50781l-7.63672,12c-0.369,0.58 -0.9995,0.92773 -1.6875,0.92773h-2.44336l-0.26953,1.25195c-0.055,0.258 -0.14152,0.50405 -0.22852,0.74805h2.93945c1.375,0 2.637,-0.69252 3.375,-1.85352l7.63672,-12c0.574,-0.902 0.76325,-1.97263 0.53125,-3.01563c-0.01024,-0.04604 -0.03121,-0.08738 -0.04297,-0.13281h6.13867v-6h-14c-0.552,0 -1,0.448 -1,1h-9c-0.552,0 -1,0.448 -1,1h-4.43945c-1.03463,-2.90598 -3.80743,-5 -7.06055,-5zM10.5,6c3.04941,0 5.5,2.45059 5.5,5.5c0,3.04941 -2.45059,5.5 -5.5,5.5c-3.04941,0 -5.5,-2.45059 -5.5,-5.5c0,-3.04941 2.45059,-5.5 5.5,-5.5z"

const useStyles = makeStyles(theme => ({

}))

export default function TelescopeIcon({ width, height, transformOrigin, fill }) {
  const styleProps = {
  }
  const classes = useStyles(styleProps);

  return (
    <svg viewBox="0,0,256,256" width={`${width}px`} height={`${height}px`} transformorigin={transformOrigin} >
        <g fill={fill} fillRule="nonzero" stroke="none" strokeWidth="1" strokeLinecap="butt" strokeLinejoin="miter" strokeMiterlimit="10" 
           strokeDasharray="" strokeDashoffset="0" fontFamily="none" fontWeight="none" fontSize="none" 
           textAnchor="none" style={{ mixBlendMode: "normal" }}>
            <g transform="scale(5.12,5.12)">
                <path d={pathD}></path>
            </g>
        </g>
    </svg>
  )
}

TelescopeIcon.defaultProps = {
    fill:"#e8e8e8",
    width:30,
    height:30,
    transformOrigin:"top left"
}