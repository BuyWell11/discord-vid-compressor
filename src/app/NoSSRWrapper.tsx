import dynamic from 'next/dynamic';
import React, { FC } from 'react';

interface NoSSRWrapperProps {
  children: React.ReactNode;
}

const NoSSRWrapper: FC<NoSSRWrapperProps> = ({ children }) => <React.Fragment>{children}</React.Fragment>;

export default dynamic(() => Promise.resolve(NoSSRWrapper), { ssr: false });
