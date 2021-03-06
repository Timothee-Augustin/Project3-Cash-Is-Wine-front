import React, { useRef, useState, useEffect } from 'react';
import { Redirect, NavLink } from 'react-router-dom';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import ShowWinary from '../components/ShowWinary';
import { useLoginData } from '../contexts/LoginDataContext';
import { useWinary } from '../contexts/WinaryContext';
import { useReferenceList } from '../contexts/ReferenceListContext';
import './Profile.css';
import Logocash from './assets/logocash.png';

const link = (path, text) => <NavLink to={path} exact activeClassName="active" className="link">{text}</NavLink>;

const toastConfig = {
  position: 'top-center',
  autoClose: 4000,
  hideProgressBar: false,
  closeOnClick: true,
  pauseOnHover: true,
  draggable: true,
  progress: undefined,
};

function Login() {
  const { loginData } = useLoginData();
  const { winary, setWinary } = useWinary();
  const { referenceList } = useReferenceList();

  if (loginData == null) {
    return <Redirect to="/login" />;
  }

  const [bottleFrontFile, setBottleFrontFile] = useState();
  const [bottleBackFile, setBottleBackFile] = useState();

  const [appellation, setAppellation] = useState();
  const [color, setColor] = useState();
  const [type, setType] = useState();
  const [year, setYear] = useState();
  const rewardInput = useRef();

  useEffect(() => {
    setColor();
    setType();
    setYear();
  }, [appellation]);

  const changeFront = (e) => {
    setBottleFrontFile(e.target.files[0]);
  };

  const changeBack = (e) => {
    setBottleBackFile(e.target.files[0]);
  };

  const handleSubmit = () => {
    let imageFront;
    let imageBack;
    const formData = new FormData();
    formData.append('bottleFront', bottleFrontFile);
    formData.append('bottleBack', bottleBackFile);
    const uploadUrl = `${process.env.REACT_APP_API_URL}/upload`;
    const bottleUrl = `${process.env.REACT_APP_API_URL}/users/${loginData.userId}/bottles`;
    axios.post(uploadUrl, formData)
      .then((response) => {
        if (response.data.imageFront != null && response.data.imageBack != null) {
          imageFront = response.data.imageFront.originalname;
          imageBack = response.data.imageBack.originalname;
          toast.success('La bouteille a ??t?? ajout??e avec succ??s', toastConfig);
        } else if (response.data.imageFront != null) {
          toast.warning(response.data.error, toastConfig);
          imageFront = response.data.imageFront.originalname;
        } else if (response.data.imageBack != null) {
          toast.warning(response.data.error, toastConfig);
          imageBack = response.data.imageBack.originalname;
        }
        axios.post(bottleUrl, {
          type,
          appellation,
          year,
          reward: rewardInput.current.value,
          frontImg: imageFront,
          backImg: imageBack,
          quantity: 1,
        })
          .then((res) => {
            setWinary((previousWinary) => ([res.data, ...previousWinary]));
          });
      })
      .catch((err) => {
        if (err.response.status === 400) {
          toast.error('Impossible d\'ajouter la bouteille. Les deux images sont trop volumineuses.', toastConfig);
        }
      });
  };

  return (
    <>
      <div className="navBar" />
      <section className="decoBtn">{ link('/logout', 'D??connexion', 'dcButton') }</section>
      <div className="logo">
        <NavLink to="/" exact activeClassName="active" className="linkHome"><img className="logocashprofile" src={Logocash} alt="logo" /></NavLink>
        {/* <a href="http://localhost:3000/"> */}
      </div>
      <div className="formContainer">
        <h1 className="titleWinary">
          Vinoth??que de
          {' '}
          {loginData.email}
        </h1>
        <div className="bottleForm">
          {referenceList && (
            <>
              <label className="labelBottle" htmlFor="appellation">Appellation</label>
              <select className="inputBottle" value={appellation} onChange={(event) => setAppellation(event.target.value)}>
                <option value="">--Veuillez choisir une appellation--</option>
                {[...new Set(referenceList.map((ref) => ref.appellation))].map(
                  (appell) => (<option>{appell}</option>),
                )}
              </select>
            </>
          )}

          {appellation && (
            <>
              <label className="labelBottle" htmlFor="type">Couleur</label>
              <select className="inputBottle" value={color} onChange={(event) => setColor(event.target.value)}>
                <option value="">--Veuillez choisir une couleur--</option>
                {[...new Set(referenceList
                  .filter((reference) => reference.appellation === appellation)
                  .map((ref) => ref.color))]
                  .map((oneColor) => (<option>{oneColor}</option>))}
              </select>
            </>
          )}

          {color && (
            <>
              <label className="labelBottle" htmlFor="type">Type</label>
              <select className="inputBottle" onChange={(event) => setType(event.target.value)}>
                <option value="">--Veuillez choisir un type--</option>
                {[...new Set(referenceList
                  .filter((reference) => reference.appellation === appellation
                  && reference.color === color)
                  .map((ref) => ref.type))]
                  .map((onetype) => (<option>{onetype}</option>))}
              </select>
            </>
          )}

          {type && (
            <>
              <label className="labelBottle" htmlFor="year">Mill??sime</label>
              <select className="inputBottle" onChange={(event) => setYear(event.target.value)}>
                <option value="">--Veuillez choisir un mill??sime--</option>
                {[...new Set(referenceList
                  .filter((reference) => reference.appellation === appellation
                  && reference.color === color
                  && reference.type === type)
                  .map((ref) => ref.year))]
                  .map((oneYear) => (<option>{oneYear}</option>))}
              </select>
            </>
          )}

          {year && (
            <>
              <label className="labelBottle" htmlFor="medal">
                R??compense/M??daille
              </label>
              <select className="inputBottle" ref={rewardInput}>
                <option value="">--Veuillez choisir une r??compense--</option>
                {referenceList.filter(
                  (reference) => reference.appellation === appellation
                  && reference.color === color
                  && reference.type === type
                  && reference.year === parseInt(year, 10),
                )
                  .map((ref) => (<option>{ref.reward}</option>))}
              </select>
            </>
          )}
        </div>
        <div className="etiquetteContainer">
          <label className="labelImage" htmlFor="labelRecto">Etiquette</label>
          <input className="inputImage" type="file" id="labelRecto" name="fileFront" placeholder="Ajoutez votre image" onChange={changeFront} />
          <div className="divtruc">
            <label className="labelImage" htmlFor="labelVerso">Contre-etiquette</label>
            <input className="inputImage" type="file" id="labelVerso" name="fileBack" placeholder="Ajoutez votre image" onChange={changeBack} />
          </div>
        </div>
        <div className="btnContainer">
          <button
            className="btnBottle"
            type="submit"
            onClick={() => {
              handleSubmit();
            }}
          >
            Ajouter ?? la vinoth??que
          </button>
          <ToastContainer
            position="top-center"
            autoClose={4000}
            hideProgressBar={false}
            newestOnTop={false}
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
          />
          {/* Same as */}
          <ToastContainer />
        </div>
      </div>
      <section className="bottleCountContainer" htmlFor="bottleCount">
        <h1 className="bottleCount">
          {' '}
          Vous poss??dez
          {'  '}
          {winary.reduce((acc, bottle) => acc + bottle.quantity, 0)}
          {'  '}
          bouteille(s)
        </h1>
      </section>
      <ShowWinary />
    </>
  );
}

export default Login;
