import Navbar from '../subscript/universal/Navbar.js';
import Footer from '../subscript/universal/Footer.js';

const PageWrapper = (name, Page, {appearingAsValue, pageID, userId, ...kwargs} = {}) => {

    return (
        
        <div id="page-container">
            <div id="content-wrap">
                <div className="grid-navbar">
                    <Navbar appearingAsValue={appearingAsValue} pageId={pageID} userId={userId}/>
                </div>
                <div id={name} className='page' /* style={{height:"88vh"}} */>
                    <Page />
                </div>
                <div className="grid-footer">
                    <Footer />
                </div>
            </div>
        </div>
    )
}

export default PageWrapper;