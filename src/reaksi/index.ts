import {createElement} from "./create-element";
import {render} from "./render";
import {useEffect} from "./hooks/useEffect";
import useState from "./hooks/useState";
import {useContext, createContext} from "./hooks/useContext";
import {useSelector, useDispatch, Provider} from "./hooks/useRedux";

const reaksi = {
    render,
    createElement,
    useState,
    useEffect,
    useContext,
    createContext,
    useSelector,
    useDispatch,
    Provider
}

export default reaksi;
export {
    useState,
    useEffect,
    useContext,
    createContext,
    useSelector,
    useDispatch,
    Provider,
    render
}
