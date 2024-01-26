"use client"

import styles from "@/styles/Header.module.css"
import Image from "next/image"
import logo from "public/set-logo.jpg"
import Link from "next/link"
import UserIcon from "./shared/UserIcon"

const Header = () => {
  return (
    <div className={styles.container}>
      <Link href={"/"}>
        <div className={styles.logoContainer}>
          <Image
            src={logo}
            alt="logo"
            priority={true}
            className={styles.logo}
          />
        </div>
      </Link>
      <div className={styles.user}>
        <UserIcon />
      </div>
    </div>
  )
}

export default Header
