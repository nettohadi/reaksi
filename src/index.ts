import { createElement } from './create-element';
import { render } from './render';
import { useEffect } from './hooks/useEffect';
import useState from './hooks/useState';
import { useContext, createContext } from './hooks/useContext';
import { useSelector, useDispatch, Provider } from './hooks/useRedux';
import { useRef } from './hooks/useRef';
import { Router, useRouter, Route, Link, useParam } from './hooks/useRouter';
import { Fragment } from './components/Fragment';
export * from './types';

const ReduxProvider = Provider;

const Reaksi = {
   render,
   createElement,
   useState,
   useEffect,
   useContext,
   createContext,
   useSelector,
   useDispatch,
   ReduxProvider,
   useRef,
   Router,
   Route,
   Link,
   useParam,
   useRouter,
   Fragment,
};

export default Reaksi;

export {
   useState,
   useEffect,
   useContext,
   createContext,
   useSelector,
   useDispatch,
   ReduxProvider,
   useRef,
   Router,
   Route,
   Link,
   useParam,
   useRouter,
   render,
};
