import {createElement} from "./create-element";
import {render} from "./render";
import {useEffect} from "./hooks/useEffect";
import useState from "./hooks/useState";
import {useContext, createContext} from "./hooks/useContext";
import {useSelector, useDispatch, Provider} from "./hooks/useRedux";
import {useRef} from "./hooks/useRef";
import {Router, useRouter} from "./hooks/useRouter";
import {Constants} from "./types";
import {Fragment} from "./components/Fragment";

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
    useRouter,
    Fragment
}

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
    useRouter,
    render
}
