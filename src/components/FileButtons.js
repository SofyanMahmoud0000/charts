import React from 'react'
import Button from '@mui/material/Button';
import { FILES } from '../enums/Files';
import Grid from '@mui/material/Grid';

const FileButtons = ({handleButtonClick}) => {
  return (
    <>

      <Grid container direction="row" spacing={2} justifyContent="center" alignItems="center">
        {
          Object.values(FILES).map(FILE => {
            return (
              <Grid item xs={3} >
                <Button 
                  size="large" 
                  variant="contained" 
                  style={{ width: "50%", margin: "auto", display:"grid" }}
                  onClick={() => handleButtonClick(FILE)}
                  >{FILE}</Button>
              </Grid>
            )
          })
        }
      </Grid>
    </>
  )
}

export default FileButtons