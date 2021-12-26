import React, { useEffect, useState } from 'react'
import axios from 'axios'

const App = () => {

   const [file, setFile] = useState(null);
   const [category, setCategory] = useState('');
   const [uploaded, setUploaded] = useState(false);
   const [error, setError] = useState('');
   const [progressState, setProgress] = useState(null);
   const [imgURL, setImgURL] = useState(null);
   const [alert, setAlert] = useState(true);
   const [alertPos, setAlertPos] = useState('');

   useEffect(() => {
      setTimeout(() => {
         setAlertPos('down');
      }, 1000);
      setTimeout(() => {
         setAlertPos('up');
      }, 3500);
      setTimeout(() => {
         setAlert(false);
      }, 4000);
   }, [])

   const selectFileHandler = (e) => {
      setFile(e.target.files[0]);
      setCategory('');
      setUploaded(false);
      setError('');
      setProgress(null);
   }

   const categoryHandler = (e) => {
      setCategory(e.target.value);
   }

   const fileUploadHandler = async () => {
      setUploaded(false);
      setError('');
      setProgress(null);
      if(file!==null && category!=='') {
         const fd = new FormData();
         fd.append('image', file);
         try{
            const res = await axios.post(`https://aws-s3-image-uploader.herokuapp.com/upload`, fd, {
               headers: {
                  'Content-Type': 'multipart/form-data'
               },
               onUploadProgress: progress => {
                  setProgress(Math.round(progress.loaded / progress.total * 100));
                  setError('');
               }
            });
            if(res) {
               setUploaded(true);
               setError('');
               setImgURL(res.data.url);
               console.log(res.data.url);
            }
            else {
               setError('not uploaded');
               setUploaded(false);
               setProgress(null);
            }
         } catch(err) {
            setError(err.message);
            setUploaded(false);
            setProgress(null);
         }
      } else {
         setError('select both file and options');
         setUploaded(false);
         setProgress(null);
      }
   }
   
   return (
      <div className='uploadPage'>
         {alert && <div className={`alertBox ${alertPos}`}><i className="fas fa-exclamation-triangle"></i> Please upload files with proper <b>names</b>.</div>}
         <div className="display">
            <div className="imgDisplay">
               { (file === null) && <p>Image will be shown here</p> }
               { (file !== null) && <img src={URL.createObjectURL(file)} alt="" /> }
            </div>
            <input type="file" name="file" id='inpField' onChange={selectFileHandler}/>
            <label htmlFor="inpField"><i className="fas fa-plus"></i></label>
         </div>

         <select name="category" value={ category } onChange={ categoryHandler }>
            <option value=''>None</option>
            <option value="0">Image Store</option>
         </select>
         <button onClick={ fileUploadHandler }>Upload <i className="fas fa-cloud-upload-alt"></i></button>
         <h2 className={progressState===null?'progress':'progress active'}>{progressState}%</h2>
         <h2 className={uploaded===false?'done':'done active'}>Done <i className="fas fa-check-circle"></i></h2>
         {uploaded===true && <div className='url'><a href={imgURL} target='_blank' rel="noreferrer">{imgURL}</a></div>}
         <h2 className={error===''?'error':'error active'}>Error: {error}</h2>
      </div>
   )
}

export default App
