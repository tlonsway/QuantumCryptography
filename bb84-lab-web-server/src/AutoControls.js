import * as React from 'react';
import { useEffect, useState } from 'react';
import { Typography, Paper, TextField } from '@mui/material/';

import './App.css';

function AutoControls() {
  const [message, setMessage] = useState("");

  return (
    <div>
      <Typography
        variant="h6"
        noWrap
        sx={{
          mr: 2,
          display: { xs: 'none', md: 'flex' },
          fontFamily: 'monospace',
          fontWeight: 700,
          letterSpacing: '.3rem',
          color: 'inherit',
          textDecoration: 'none',
        }}
      >

      </Typography>
    </div>
  );
}

export default AutoControls;
