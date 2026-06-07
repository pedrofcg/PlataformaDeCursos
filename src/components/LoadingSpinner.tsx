const LoadingSpinner = () => {
  return (
    <div className="loading-container">
      <div className="spinner-border" role="status">
        <span className="visually-hidden">Carregando...</span>
      </div>
      <p>Carregando dados...</p>
    </div>
  );
};

export default LoadingSpinner;
