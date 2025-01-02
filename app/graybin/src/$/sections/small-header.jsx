const SmallHeader =({ logo, title }) => {
  return (
    <div className="small-header">
      <img src={logo} alt="logo" />
      <h1>{title}</h1>
    </div>
  )

}