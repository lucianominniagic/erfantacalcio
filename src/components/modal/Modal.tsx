import * as React from 'react'
import Backdrop from '@mui/material/Backdrop'
import Box from '@mui/material/Box'
import Modal from '@mui/material/Modal'
import Fade from '@mui/material/Fade'
import Typography from '@mui/material/Typography'
import CloseIcon from '@mui/icons-material/Close'

export interface TransitionsModalType {
  title: string
  open: boolean
  onClose?: () => void
  children?: React.ReactNode
  width?: string
  height?: string
}

const style = {
  transform: 'translate(-50%, -50%)',
}

export default function TransitionsModal(props: TransitionsModalType) {
  const handleClose = () => {
    if (props.onClose) {
      props.onClose() // Chiudi la modal chiamando la funzione di chiusura fornita nelle props
    }
  }

  return (
    <div>
      <Modal
        keepMounted
        aria-labelledby="transition-modal-title"
        aria-describedby="transition-modal-description"
        open={props.open}
        onClose={handleClose}
        closeAfterTransition
        slots={{ backdrop: Backdrop }}
        slotProps={{
          backdrop: {
            timeout: 500,
          },
        }}
      >
        <Fade in={props.open}>
          <Box
            sx={style}
            borderRadius={2}
            boxShadow={2}
            overflow={'auto'}
            height={props.height ? props.height : 'auto'}
            width={props.width ? props.width : 'auto'}
            minWidth={400}
            bgcolor="background.paper"
            padding={2}
            position={'absolute'}
            top={'50%'}
            left={'50%'}
          >
            <CloseIcon
              style={{
                position: 'absolute',
                top: 10,
                right: 10,
                cursor: 'pointer',
              }}
              fontSize="medium"
              onClick={handleClose}
            />

            <Typography
              id="transition-modal-title"
              variant="h4"
              component="h2"
              color="primary.light"
            >
              {props.title}
            </Typography>
            <br></br>
            {props.children}
          </Box>
        </Fade>
      </Modal>
    </div>
  )
}
