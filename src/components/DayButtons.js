import React from 'react'
import Button from '@mui/material/Button';
import { DAYS } from '../enums/Days';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';

const FileButtons = ({handleButtonClick}) => {
  return (
    <>
      <Grid container direction="row" spacing={2} justifyContent="center" alignItems="center">
        {
          Object.values(DAYS).map(DAY => {
            return (
              <Grid item xs={!DAY? 4: 2} >
                <Button 
                  size="large" 
                  variant="contained" 
                  style={{ width: "50%", margin: "auto", display:"grid" }}
                  onClick={() => handleButtonClick(DAY)}
                  color={!DAY? "secondary": "primary"}
                  >{DAY? `Day ${DAY}`: `All days`}</Button>
              </Grid>
            )
          })
        }
      </Grid>
    </>
  )
}

export default FileButtons