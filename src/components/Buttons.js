import React from 'react'
import Grid from '@mui/material/Grid';
import Button from '@mui/material/Button';
import FileButtons from './FileButtons';
import DayButtons from './DayButtons';
import RestartAltIcon from '@mui/icons-material/RestartAlt';

import { COLORS } from "../enums/Colors"

const Buttons = ({ handleButtonFileClick, resetFilter, handleButtonDayClick }) => {
  return (
    <>
      <Grid container direction="row" spacing={2} justifyContent="center" alignItems="center" item xs={8}>
        <Grid item xs={12}>
          <div style={{}}>
            <FileButtons handleButtonClick={handleButtonFileClick} />
          </div>
        </Grid>
      </Grid>

      <Grid container direction="row" spacing={2} justifyContent="center" alignItems="center" item xs={4}>
        <Grid item xs={12} >
          <Button
            size="large"
            variant="contained"
            style={{ width: "50%", margin: "auto", display: "flex", backgroundColor: COLORS.COLOR_1 }}
            onClick={resetFilter}
          >Reset filter <RestartAltIcon style={{ display: "inline", margin: "0px 2px" }} /></Button>
        </Grid>
      </Grid>

      <Grid item xs={12}>
        <div style={{}}>
          <DayButtons handleButtonClick={handleButtonDayClick} />
        </div>
      </Grid>
    </>
  )
}

export default Buttons