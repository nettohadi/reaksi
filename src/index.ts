import {createElement} from "./create-element";
import {render} from "./render";
import {useEffect} from "./hooks/useEffect";
import useState from "./hooks/useState";
import {useContext, createContext} from "./hooks/useContext";
import {useSelector, useDispatch, Provider} from "./hooks/useRedux";
import {useRef} from "./hooks/useRef";
import {Router, useRouter, Route} from "./hooks/useRouter";
import {Fragment} from "./components/Fragment";
import type {ReaksiType} from "./types";

const ReduxProvider = Provider;
/**
* {Object} Reaksi - Base Adder object
* {function} Reaksi.render - A function render on the Reaksi
*/
const Reaksi:ReaksiType = {
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
    Route,
    useRouter,
    render
}
