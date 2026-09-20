import React from 'react';
import {Link} from 'react-router-dom';
import {safeUrl} from './types';

export default function SourceLink({url,children,className}:{url?:string;children:React.ReactNode;className?:string}){
  const destination=safeUrl(url);
  if(!destination)return null;
  return destination.startsWith('/')
    ? <Link className={className} to={destination}>{children}</Link>
    : <a className={className} href={destination} target="_blank" rel="noreferrer">{children}</a>;
}
