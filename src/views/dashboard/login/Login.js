import React from "react"
import { Link } from "react-router-dom"
import { Button, Form, FormGroup, Input, Label } from "reactstrap"
import { Eye, EyeOff, Lock, Phone, User } from "react-feather"
import { connect } from "react-redux"
import { loginAgent } from "../../../redux/actions/auth/loginActions"
import logo from "../../../assets/img/logo/logo.png"
import background from "../../../assets/img/backgrounds/back.jpg"
import "../../../assets/scss/pages/dashboard-login.scss"

class Login extends React.Component {
  state = {
    phone: "",
    password: "",
    remember: false,
    showPassword: false,
    error: "",
    isSubmitting: false
  }

  handleSubmit = async event => {
    event.preventDefault()
    this.setState({ error: "", isSubmitting: true })

    try {
      await this.props.loginAgent({
        login: this.state.phone,
        pwd: this.state.password
      })
    } catch (error) {
      this.setState({ error: error.message, isSubmitting: false })
    }
  }

  render() {
    const { phone, password, remember, showPassword, error, isSubmitting } = this.state

    return (
      <main
        className="agent-login"
        style={{ backgroundImage: `url(${background})` }}
      >
        <div className="agent-login__overlay" />
        <section className="agent-login__card" aria-labelledby="login-title">
          <header className="agent-login__header">
            <img className="agent-login__logo" src={logo} alt="Logo TransAcademia" />
            <div className="agent-login__title">
              <User size={27} aria-hidden="true" />
              <h1 id="login-title">Connexion Agent</h1>
            </div>
            <p>Accédez à votre espace de gestion TransAcademia.</p>
          </header>

          <Form onSubmit={this.handleSubmit} className="agent-login__form">
            {error ? <div className="agent-login__error" role="alert">{error}</div> : null}
            <FormGroup>
              <Label for="phone">Téléphone</Label>
              <div className="agent-login__field">
                <Phone size={20} aria-hidden="true" />
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  inputMode="tel"
                  placeholder="Numéro de téléphone"
                  value={phone}
                  onChange={event => this.setState({ phone: event.target.value })}
                  required
                />
              </div>
            </FormGroup>

            <FormGroup>
              <Label for="password">Mot de passe</Label>
              <div className="agent-login__field">
                <Lock size={20} aria-hidden="true" />
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Mot de passe"
                  value={password}
                  onChange={event => this.setState({ password: event.target.value })}
                  required
                />
                <button
                  type="button"
                  className="agent-login__password-toggle"
                  onClick={() => this.setState({ showPassword: !showPassword })}
                  aria-label={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
                >
                  {showPassword ? <EyeOff size={19} /> : <Eye size={19} />}
                </button>
              </div>
            </FormGroup>

            <div className="agent-login__options">
              <Label check className="agent-login__remember">
                <Input
                  type="checkbox"
                  checked={remember}
                  onChange={event => this.setState({ remember: event.target.checked })}
                />
                <span>Se souvenir de moi</span>
              </Label>
              <Link to="/pages/forgot-password">Mot de passe oublié ?</Link>
            </div>

            <Button.Ripple type="submit" className="agent-login__submit" disabled={isSubmitting}>
              {isSubmitting ? "Connexion en cours..." : "Connexion"}
            </Button.Ripple>
          </Form>
        </section>
      </main>
    )
  }
}

export default connect(null, { loginAgent })(Login)
