import Container from '../../components/Container/Container';

const Welcome = () => {
    return (
        <div>
            <Container>
                <div className="max-2xl:px-5 text-primaryText">
                    <div className="py-3 space-y-3 text-center">
                        <h1 className="text-3xl text-primaryBlue font-semibold">
                            Welcome 
                        </h1>
               
                    </div>
                    
                </div>
            </Container>
        </div>
    );
};

export default Welcome;
