import React, { useState, useRef } from 'react';
import { Pane, UploadIcon, Text, Spinner, toaster } from 'evergreen-ui';
import { blake2AsHex } from '@polkadot/util-crypto';

import OffchainServices from '../offchain-services';

export default function ImageUploader(props) {
  const { baseKey, onImagesUploaded } = props;

  const [base64, setBase64] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const fileSelectRef = useRef();

  const selectFile = () => {
    fileSelectRef.current && fileSelectRef.current.click();
  };

  const uploadImage = async (base64, proof, contentType) => {
    setIsLoading(true);

    try {
      const response = await OffchainServices.uploadImage({
        key: `${baseKey}/${proof.slice(-10)}_${Date.now()}.${
          contentType.split('/')[1]
        }`,
        base64,
        contentType,
      });

      onImagesUploaded && onImagesUploaded([{ url: response.url, proof }]);
    } catch (err) {
      toaster.danger(`😞 Upload Image Failed: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const onFileSelected = e => {
    const file = e.target.files[0];

    if (file) {
      const reader = new FileReader();

      reader.onload = fileEvent => {
        const base64 = fileEvent.target.result;
        const proof = blake2AsHex(fileEvent.target.result, 256);
        setBase64(base64);
        uploadImage(base64, proof, file.type);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <Pane
      position="relative"
      borderRadius="4px"
      border="solid 1px #c1c4d6"
      height="100%"
      width="100%"
    >
      {!!base64 && (
        <Pane
          width="100%"
          height="100%"
          display="flex"
          alignItems="center"
          position="absolute"
          zIndex="2"
          background="tint2"
        >
          <img width="100%" maxWidth="100%" maxHeight="100%" src={base64}></img>
        </Pane>
      )}

      {!isLoading && (
        <Pane
          width="100%"
          height="100%"
          position="absolute"
          top="0"
          left="0"
          display="flex"
          flexDirection="column"
          alignItems="center"
          justifyContent="center"
          cursor="pointer"
          background="tint2"
          zIndex="1"
          onClick={selectFile}
        >
          <UploadIcon size="24" color="#c1c4d6"></UploadIcon>
          <Text size={300} marginTop="8px">
            Upload image
          </Text>
        </Pane>
      )}

      {isLoading && (
        <Pane
          width="100%"
          height="100%"
          position="absolute"
          top="0"
          left="0"
          display="flex"
          flexDirection="column"
          alignItems="center"
          justifyContent="center"
          cursor="pointer"
          background="tint2"
          zIndex="3"
        >
          <Spinner></Spinner>
          <Text size={300} marginTop={8}>
            Uploading image
          </Text>
        </Pane>
      )}

      <input
        ref={fileSelectRef}
        hidden
        type="file"
        onChange={onFileSelected}
      ></input>
    </Pane>
  );
}
