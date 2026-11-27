import React from "react"
import * as Icon from "react-feather"

import { AGENCY_MANAGER } from "../services/auth/roles"

export const agencyNavigation = [
  {
    id: "agency-home",
    title: "Accueil",
    type: "item",
    icon: <Icon.Home size={20} />,
    permissions: [AGENCY_MANAGER],
    navLink: "/accueil-agence"
  },
  {
    id: "PrixCargo-list",
    title: "Tarifs cargo",
    type: "item",
    icon: <Icon.Menu size={20} />,
    permissions: [AGENCY_MANAGER],
    navLink: "/prixcargo"
  },
  {
    id: "soutes",
    title: "Soutes",
    type: "item",
    icon: <Icon.Truck size={20} />,
    permissions: [AGENCY_MANAGER],
    navLink: "/soutes"
  }
]

const permissions = ["admin", "editor"]

const navigationConfigCustom = [
  {
    id: "theme",
    title: "Thème",
    type: "item",
    icon: <Icon.Layout size={20} />,
    permissions,
    navLink: "/theme"
  },
  {
    id: "home",
    title: "Accueil",
    type: "item",
    icon: <Icon.Home size={20} />,
    permissions,
    navLink: "/dashboard"
  },
  {
    id: "agents",
    title: "Agents",
    type: "item",
    icon: <Icon.Users size={20} />,
    permissions,
    navLink: "/agents-urbain"
  },
  {
    id: "agences",
    title: "Agences",
    type: "item",
    icon: <Icon.Home size={20} />,
    permissions,
    navLink: "/agences"
  },
  {
    id: "entites",
    title: "Territoires",
    type: "collapse",
    icon: <Icon.Map size={20} />,
    children: [
      {
        id: "provinces-list",
        title: "Liste des provinces",
        type: "item",
        icon: <Icon.Menu size={12} />,
        permissions,
        navLink: "/provinces"
      },
      {
        id: "Villes-list",
        title: "Liste des villes",
        type: "item",
        icon: <Icon.Menu size={12} />,
        permissions,
        navLink: "/villes"
      },
      {
        id: "Communes-list",
        title: "Liste des communes",
        type: "item",
        icon: <Icon.Menu size={12} />,
        permissions,
        navLink: "/communes"
      }
    ]
  },
  {
    id: "donnees",
    title: "Données",
    type: "collapse",
    icon: <Icon.Folder size={20} />,
    children: [
       {
        id: "donnees-service",
        title: "Services",
        type: "item",
        icon: <Icon.Menu size={12} />,
        permissions,
        navLink: "/services"
      },
      {
        id: "donnees-operateur",
        title: "Opérateurs de paiement",
        type: "item",
        icon: <Icon.Menu size={12} />,
        permissions,
        navLink: "/operateurs"
      },
      {
        id: "donnees-currency",
        title: "Devises",
        type: "item",
        icon: <Icon.Menu size={12} />,
        permissions,
        navLink: "/currencies"
      }
    ]
  },
  {
    id: "operations",
    title: "Opérations",
    type: "collapse",
    icon: <Icon.CreditCard size={20} />,
    children: [
      {
        id: "ligne-list",
        title: "Lignes",
        type: "item",
        icon: <Icon.MapPin size={12} />,
        permissions,
        navLink: "/lignes"
      },
      {
        id: "PrixLigne-list",
        title: "Tarifs",
        type: "item",
        icon: <Icon.Menu size={12} />,
        permissions,
        navLink: "/prixlignes"
      },
         {
        id: "TypeColis-list",
        title: "Types de colis",
        type: "item",
        icon: <Icon.Menu size={12} />,
        permissions,
        navLink: "/colis"
      },
       {
        id: "booking-list",
        title: "Réservations",
        type: "item",
        icon: <Icon.Menu size={12} />,
        permissions,
        navLink: "/reservations"
      }

    ]
  },
  {
    id: "administration",
    title: "Administration",
    type: "collapse",
    icon: <Icon.Settings size={20} />,
    children: [
      {
    id: "agents kisalu",
    title: "Agents kisalu",
    type: "item",
    icon: <Icon.Users size={20} />,
    permissions,
    navLink: "/agents"
     },
      {
        id: "administration-utilisateurs",
        title: "Utilisateurs",
        type: "item",
        icon: <Icon.Circle size={12} />,
        permissions,
        navLink: "/administration/utilisateurs"
      },
      {
        id: "administration-roles",
        title: "Rôles",
        type: "item",
        icon: <Icon.Circle size={12} />,
        permissions,
        navLink: "/administration/roles"
      }
    ]
  }
]

export default navigationConfigCustom
