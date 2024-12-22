import dynamic from 'next/dynamic';
import React, { FC } from 'react';
const NoSSRWrapper: FC = (props: React.PropsWithChildren<{}>) => <React.Fragment>{props.children}</React.Fragment>;
export default dynamic(() => Promise.resolve(NoSSRWrapper), {
  ssr: false,
});
