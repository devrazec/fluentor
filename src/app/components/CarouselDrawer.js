'use client';

import {
  Drawer,
  IconButton,
  Box,
  Paper,
  MobileStepper,
  Button,
  Typography,
  Badge,
} from '@mui/material';
import { useState, useEffect } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Close,
  AutoAwesome,
} from '@mui/icons-material';
import './CarouselDrawer.css';

export default function CarouselDrawer({ images = [] }) {
  const [open, setOpen] = useState(false);
  const [activeStep, setActiveStep] = useState(0);
  const [buttonStep, setButtonStep] = useState(0);

  // Auto-play for the button preview
  useEffect(() => {
    if (images.length > 0) {
      const timer = setInterval(() => {
        setButtonStep(prev => (prev + 1) % images.length);
      }, 2500); // Slightly faster for the button
      return () => clearInterval(timer);
    }
  }, [images.length]);

  // Auto-play feature for the drawer
  useEffect(() => {
    if (open && images.length > 0) {
      const timer = setInterval(() => {
        handleNext();
      }, 3000);
      return () => clearInterval(timer);
    }
  }, [open, images.length]);

  const handleNext = () => {
    setActiveStep(prevStep => (prevStep + 1) % images.length);
  };

  const handleBack = () => {
    setActiveStep(prevStep =>
      prevStep === 0 ? images.length - 1 : prevStep - 1
    );
  };

  const handleDrawerToggle = () => {
    setOpen(!open);
  };

  return (
    <>
      {/* Floating Button - Merged with top center */}
      <div className="carousel-fab">
        <IconButton
          onClick={handleDrawerToggle}
          className="carousel-fab-button shiny-effect"
          sx={{
            backgroundColor: '#00A76F',
            color: 'white',
            padding: '0',
            width: '84px', // Back to a consistent size for a circle
            height: '84px',
            borderRadius: '50%', // Perfect circle
            overflow: 'hidden',
            '&:hover': {
              backgroundColor: '#008b5d',
              transform: 'translateX(-50%) scale(1.1)', // Keep center while scaling
            },
            boxShadow: '0 4px 12px rgba(0, 167, 111, 0.4)',
            border: '4px solid #ffffff', // White border to help it blend/pop
          }}
        >
          {images.length > 0 ? (
            <img
              src={images[buttonStep]}
              alt="Preview"
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                animation: 'fadeIn 0.5s ease-in',
              }}
            />
          ) : (
            <AutoAwesome sx={{ fontSize: '20px' }} />
          )}
        </IconButton>
      </div>

      {/* Drawer */}
      <Drawer
        anchor="bottom"
        open={open}
        onClose={handleDrawerToggle}
        PaperProps={{
          sx: {
            borderRadius: '10px 10px 0 0',
            maxHeight: open ? '80vh' : '120px',
            background: 'linear-gradient(135deg, #004d40 0%, #00A76F 100%)',
            animation: open
              ? 'slideUp 0.5s ease-out'
              : 'slideDown 0.5s ease-out',
          },
        }}
      >
        <Box sx={{ p: 3, height: '100%' }}>
          {/* Header */}
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'flex-end',
              alignItems: 'flex-end',
              //mb: 2,
            }}
          >
            {/* <h2 style={{ margin: 0, color: 'white' }}>Fluentor</h2> */}
            <IconButton onClick={handleDrawerToggle} sx={{ color: 'white' }}>
              <Close />
            </IconButton>
          </Box>

          {/* Carousel Container */}
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              //mb: 2,
            }}
          >
            {images.length > 0 ? (
              <Paper
                elevation={8}
                sx={{
                  position: 'relative',
                  //width: '220px',
                  height: '320px',
                  borderRadius: '12px',
                  overflow: 'hidden',
                  backgroundColor: '#f5f5f5',
                }}
              >
                <img
                  src={images[activeStep]}
                  alt={`Slide ${activeStep + 1}`}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'contain',
                    animation: 'fadeIn 0.3s ease-in',
                  }}
                />
              </Paper>
            ) : (
              <Paper
                sx={{
                  //width: '220px',
                  height: '320px',
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  backdropFilter: 'blur(10px)',
                  color: 'white',
                  fontSize: '16px',
                  textAlign: 'center',
                  padding: '16px',
                }}
              >
                No images yet. Add some pictures!
              </Paper>
            )}
          </Box>

          {/* Controls */}
          {/* {images.length > 0 && (
            <Box>
              <MobileStepper
                steps={images.length}
                position="static"
                activeStep={activeStep}
                sx={{
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  borderRadius: '8px',
                  mb: 2,
                  '& .MuiMobileStepper-dotActive': {
                    backgroundColor: 'white',
                  },
                }}
                nextButton={
                  <Button
                    size="small"
                    onClick={handleNext}
                    sx={{ color: 'white' }}
                  >
                    <ChevronRight />
                  </Button>
                }
                backButton={
                  <Button
                    size="small"
                    onClick={handleBack}
                    sx={{ color: 'white' }}
                  >
                    <ChevronLeft />
                  </Button>
                }
              />
            </Box>
          )} */}
        </Box>
      </Drawer>
    </>
  );
}
