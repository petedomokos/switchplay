import React, { useEffect, useState } from 'react'
import { makeStyles } from '@material-ui/core/styles'
import Typography from '@material-ui/core/Typography'
import { styles } from '@material-ui/pickers/views/Calendar/Calendar'

const useStyles = makeStyles(theme => ({
    root: {
        //border:"solid",
    },
}))

export default function Tick({style}){
  const classes = useStyles()
  return (
      <div className={classes.root} style={style.root || {}}>
        <svg
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            >
            <path
                stroke="white"
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4.5 12.75l6 6 9-13.5"
            />
        </svg>
      </div>
  )
}

Tick.defaultProps = {
    style:{},
  }
