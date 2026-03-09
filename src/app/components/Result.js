'use client';

import React, {
  useState,
  useRef,
  useCallback,
  useEffect,
  useContext,
} from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { GlobalContext } from '../context/GlobalContext';
import { Gauge, gaugeClasses } from '@mui/x-charts/Gauge';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';

const legendItems = [
  {
    label: '0 – 59',
    color: '#f44336',
    level: 'Basic',
    cefr: 'A1 – A2',
    ielts: '0 – 3.5',
    toefl: '0 – 40',
    description:
      'Speech has many pronunciation errors. Listeners may struggle to understand without repetition. Limited fluency and accuracy.',
  },
  {
    label: '60 – 79',
    color: '#ffc107',
    level: 'Intermediate',
    cefr: 'B1 – B2',
    ielts: '4.0 – 6.0',
    toefl: '41 – 90',
    description:
      'Pronunciation is generally understandable but contains noticeable errors. Fluency is moderate. Communication works but with some effort.',
  },
  {
    label: '80 – 100',
    color: '#4caf50',
    level: 'Advanced',
    cefr: 'C1 – C2',
    ielts: '6.5 – 9.0',
    toefl: '91 – 120',
    description:
      'Clear pronunciation close to native-like patterns. High fluency and accuracy. Easy to understand.',
  },
];

function getGaugeColor(value) {
  if (value >= 80) return '#4caf50';
  if (value >= 60) return '#ffc107';
  return '#f44336';
}

function isActiveRow(item, value) {
  if (item.color === '#4caf50') return value >= 80;
  if (item.color === '#ffc107') return value >= 60 && value < 80;
  return value < 60;
}

export default function Result() {
  const value = 60;
  const color = getGaugeColor(value);

  return (
    <Grid container spacing={3} alignItems="center">
      {/* Gauge */}
      <Grid item xs={12} sm={4} display="flex" justifyContent="center">
        <Box sx={{ width: 180, height: 180 }}>
          <Gauge
            value={value}
            startAngle={0}
            endAngle={360}
            innerRadius="80%"
            outerRadius="100%"
            sx={{
              [`& .${gaugeClasses.valueText}`]: {
                fontSize: 20,
                transform: 'translate(0px, 0px)',
              },
              [`& .${gaugeClasses.valueArc}`]: {
                fill: color,
              },
            }}
            text={({ value, valueMax }) => `${value} / ${valueMax}`}
          />
        </Box>
      </Grid>

      {/* Legend table */}
      <Grid item xs={12} sm={8}>
        <TableContainer>
          <Table
            size="small"
            aria-label="score legend"
            sx={{ '& .MuiTableCell-root': { py: 0.5 } }}
          >
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 700, whiteSpace: 'nowrap' }}>
                  Score
                </TableCell>
                <TableCell sx={{ fontWeight: 700, whiteSpace: 'nowrap' }}>
                  Level
                </TableCell>
                <TableCell sx={{ fontWeight: 700, whiteSpace: 'nowrap' }}>
                  CEFR
                </TableCell>
                <TableCell sx={{ fontWeight: 700, whiteSpace: 'nowrap' }}>
                  IELTS
                </TableCell>
                <TableCell sx={{ fontWeight: 700, whiteSpace: 'nowrap' }}>
                  TOEFL
                </TableCell>
                <TableCell />
              </TableRow>
            </TableHead>
            <TableBody>
              {legendItems.map(item => {
                const active = isActiveRow(item, value);
                return (
                  <TableRow
                    key={item.label}
                    hover={!active}
                    sx={{
                      cursor: 'default',
                      ...(active && {
                        backgroundColor: `${item.color}22`,
                        outline: `2px solid ${item.color}`,
                        outlineOffset: '-2px',
                        '& td': { fontWeight: 700 },
                      }),
                    }}
                  >
                    <TableCell>
                      <Box display="flex" alignItems="center" gap={1}>
                        <Box
                          sx={{
                            width: 12,
                            height: 12,
                            borderRadius: '50%',
                            backgroundColor: item.color,
                            flexShrink: 0,
                          }}
                        />
                        {item.label}
                      </Box>
                    </TableCell>
                    <TableCell>{item.level}</TableCell>
                    <TableCell>{item.cefr}</TableCell>
                    <TableCell>{item.ielts}</TableCell>
                    <TableCell>{item.toefl}</TableCell>
                    <TableCell sx={{ px: 0.5 }}>
                      <Tooltip
                        title={
                          <Box>
                            <Typography
                              variant="body2"
                              fontWeight={700}
                              gutterBottom
                            >
                              {item.level}
                            </Typography>
                            <Typography variant="caption">
                              {item.description}
                            </Typography>
                          </Box>
                        }
                        arrow
                        placement="right"
                      >
                        <InfoOutlinedIcon
                          fontSize="small"
                          sx={{
                            color: 'text.secondary',
                            display: 'block',
                            cursor: 'help',
                          }}
                        />
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      </Grid>
    </Grid>
  );
}
