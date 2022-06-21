import React from 'react'
//material-ui
import Select from '@material-ui/core/Select'
import MenuItem from '@material-ui/core/MenuItem'
import FormControl from '@material-ui/core/FormControl'
import FormControlLabel from '@material-ui/core/FormControlLabel'
import FormLabel from '@material-ui/core/FormLabel'
import Radio from '@material-ui/core/Radio'
import RadioGroup from '@material-ui/core/RadioGroup'
//child components


const dropdownSt = {display:'flex', flexDirection:'column', margin:20, width:300}
export const DropdownSelector = ({description, selected, options, labelAccessor, handleChange, style}) =>{
  console.log("options", options)
  return(
    <FormControl sx={{ m: 1, minWidth: 120 }} size="small">
      <div style={{...dropdownSt, ...style}}>
        {description && <h4>{description}</h4>}
        <Select value={selected || ""} size="small"
            labelId="label" id={'select-' +description} 
            onChange={handleChange}>
          {options.map((option,i) =>
            <MenuItem value={option} key={'option-'+description+i}>{labelAccessor(option)}</MenuItem>
          )}
        </Select>
      </div>
    </FormControl>
  )
}

DropdownSelector.defaultProps = {
  labelAccessor:option => option,
  options:[],
  style:{}
}

//must have at least 1 option
export const RadioSelector  = ({formLabel, options, defaultOpt, onChange}) =>{
  //convert otions and default into label/value objects if strings
  const _options = !options[0] || options[0].value ? options :  options.map(opt => ({value:opt, label:opt}));
  const _defaultOpt = !defaultOpt || defaultOpt.value ? defaultOpt : {value:defaultOpt, label:defaultOpt}
  return(
    <FormControl component="fieldset" style={{border:'solid', width:'100%'}}>
      <FormLabel component="legend">{formLabel}</FormLabel>
      <RadioGroup
          row
          onChange={onChange} 
          value={_defaultOpt ?  _defaultOpt.value : _options[0].value}
          aria-label={formLabel} 
          name="customized-radios" 
          style={{border:'solid', borderColor:'red', width:'100%', display:'flex', alignItems:'center', justifyContent:'center'}}>
            {_options.map((option,i) =>
              <FormControlLabel 
                  value={option.value} 
                  control={<Radio />} 
                  label={option.label}
                  key={formLabel +'option-'+i} 
                  style={{border:'solid', borderColor:'yellow', margin:'10px'}}/> )}
      </RadioGroup>
    </FormControl>
  )
}







//helpers
//import { findAvailableNames, findAvailableNrParticipants, findAvailableCategories} from '../DatasetHelpers'
//import auth from '../../../auth/auth-helper'
/*
const AddStandardDataset = ({dataset, standardDatasets, handleChange, classes}) => {
  const { category, name, nrParticipants } = dataset

  //filter categories based on name and nrParticipants selection
  const availableCategories = findAvailableCategories(
    {name:name, nrParticipants:nrParticipants}, standardDatasets)
  //auto-select if only 1 option
  if(availableCategories.length === 1 && category !== availableCategories[0])
    handleChange('category')(availableCategories[0])

  //filter names based on category and nrParticipants selection
  const availableNames = findAvailableNames(
    {category:category, nrParticipants:nrParticipants}, standardDatasets)
  //auto-select if only 1 option
  if(availableNames.length === 1 && name !== availableNames[0])
    handleChange('name')(availableNames[0])

  //filter nrParticipants based on category and name selection
  const availableNrParticipants = findAvailableNrParticipants(
    {category:category, name:name}, standardDatasets)
  //auto-select if only 1 option
  if(availableNrParticipants.length === 1 && nrParticipants !== availableNrParticipants[0])
    handleChange('nrParticipants')(availableNrParticipants[0])

  return(
    <div>
      <div>Add Standard Dataset</div>
      <div style={{display:'flex', flexDirection:'column', justifyContent:'flex-start',
      margin:30}}>
        <DropdownSelector
          description='Category' 
          selected={category} 
          options={availableCategories}
          handleChange={handleChange('category')} />
        <DropdownSelector
          description='Name' 
          selected={name} 
          options={availableNames}
          handleChange={handleChange('name')} />
        <DropdownSelector
          description='Participants' 
          selected={nrParticipants} 
          options={availableNrParticipants}
          handleChange={handleChange('nrParticipants')} />
      </div>
    </div>
    )
}

*/


