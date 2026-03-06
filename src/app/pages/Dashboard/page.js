'use client';

import React, { useContext } from 'react';
import Link from 'next/link';
import DashboardLayout from '../../components/DashboardLayout';
import { GlobalContext } from '../../context/GlobalContext';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Avatar from '@mui/material/Avatar';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Skeleton from '@mui/material/Skeleton';
import {
  Category,
  DocumentText,
  MessageQuestion,
  Microphone2,
  Profile,
} from 'iconsax-reactjs';

const ACCENT = '#00a76f';

function StatCard({ icon, label, value, href, loading }) {
  return (
    <Card
      component={href ? Link : 'div'}
      href={href}
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 2,
        p: 2.5,
        textDecoration: 'none',
        transition: 'background-color 0.2s',
        '&:hover': href ? { bgcolor: '#00a76f1f' } : {},
      }}
    >
      <Box
        sx={{
          width: 52,
          height: 52,
          borderRadius: 2,
          bgcolor: '#00a76f1f',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        {icon}
      </Box>
      <Box>
        <Typography variant="body2" color="text.secondary">
          {label}
        </Typography>
        {loading ? (
          <Skeleton width={40} height={32} />
        ) : (
          <Typography variant="h5" fontWeight={700}>
            {value}
          </Typography>
        )}
      </Box>
    </Card>
  );
}

export default function DashboardPage() {
  const { dbCategory, dbTense, dbQuestion, dbAnswer } =
    useContext(GlobalContext);

  const dataLoading =
    dbCategory.length === 0 &&
    dbTense.length === 0 &&
    dbQuestion.length === 0 &&
    dbAnswer.length === 0;

  const stats = [
    {
      icon: <Category variant="Bulk" color={ACCENT} size={28} />,
      label: 'Categories',
      value: dbCategory.length,
      href: '/pages/Category/',
    },
    {
      icon: <DocumentText variant="Bulk" color={ACCENT} size={28} />,
      label: 'Tenses',
      value: dbTense.length,
      href: '/pages/Tense/',
    },
    {
      icon: <MessageQuestion variant="Bulk" color={ACCENT} size={28} />,
      label: 'Questions',
      value: dbQuestion.length,
      href: '/pages/Question/',
    },
    {
      icon: <Microphone2 variant="Bulk" color={ACCENT} size={28} />,
      label: 'Answers',
      value: dbAnswer.length,
      href: '/pages/Answer/',
    },
  ];

  return (
    <DashboardLayout>
      <Box
        sx={{
          width: '100%',
          maxWidth: { sm: '100%', md: '1700px' },
          px: { xs: 1, sm: 0 },
          py: 2,
        }}
      >
        {/* Profile card */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Box
              sx={{
                display: 'flex',
                flexDirection: { xs: 'column', sm: 'row' },
                alignItems: { xs: 'center', sm: 'flex-start' },
                gap: 3,
              }}
            >
              <Avatar sx={{ width: 96, height: 96, bgcolor: '#00a76f1f' }}>
                <Profile size={48} color={ACCENT} variant="Bulk" />
              </Avatar>
              <Box sx={{ flex: 1, textAlign: { xs: 'center', sm: 'left' } }}>
                <Typography variant="h5" fontWeight={700}>
                  Welcome to Fluentor
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mt: 0.5 }}
                >
                  Browse categories, tenses, questions and answers below.
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>

        {/* Stats */}
        <Typography
          variant="subtitle2"
          color="text.secondary"
          sx={{
            mb: 1.5,
            fontWeight: 700,
            letterSpacing: 0.5,
            textTransform: 'uppercase',
          }}
        >
          Content Overview
        </Typography>
        <Grid container spacing={2} columns={12} sx={{ mb: 3 }}>
          {stats.map(stat => (
            <Grid key={stat.label} size={{ xs: 12, sm: 6, md: 3 }}>
              <StatCard {...stat} loading={dataLoading} />
            </Grid>
          ))}
        </Grid>

        {/* Quick links */}
        <Typography
          variant="subtitle2"
          color="text.secondary"
          sx={{
            mb: 1.5,
            fontWeight: 700,
            letterSpacing: 0.5,
            textTransform: 'uppercase',
          }}
        >
          Quick Access
        </Typography>
        <Grid container spacing={2} columns={12}>
          {[
            {
              label: 'Browse Categories',
              href: '/pages/Category/',
              icon: <Category variant="Bulk" color={ACCENT} size={22} />,
            },
            {
              label: 'Browse Tenses',
              href: '/pages/Tense/',
              icon: <DocumentText variant="Bulk" color={ACCENT} size={22} />,
            },
            {
              label: 'Browse Questions',
              href: '/pages/Question/',
              icon: <MessageQuestion variant="Bulk" color={ACCENT} size={22} />,
            },
            {
              label: 'Browse Answers',
              href: '/pages/Answer/',
              icon: <Microphone2 variant="Bulk" color={ACCENT} size={22} />,
            },
          ].map(item => (
            <Grid key={item.label} size={{ xs: 12, sm: 6, md: 3 }}>
              <Button
                fullWidth
                variant="outlined"
                component={Link}
                href={item.href}
                startIcon={item.icon}
                sx={{
                  justifyContent: 'flex-start',
                  py: 1.5,
                  borderColor: '#00a76f40',
                  color: 'text.primary',
                  fontWeight: 600,
                  '&:hover': { borderColor: ACCENT, bgcolor: '#00a76f1f' },
                }}
              >
                {item.label}
              </Button>
            </Grid>
          ))}
        </Grid>
      </Box>
    </DashboardLayout>
  );
}
