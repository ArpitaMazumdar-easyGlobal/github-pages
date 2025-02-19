// import { CanActivateFn } from '@angular/router';

// export const roleGuard: CanActivateFn = (route, state) => {
//   return true;
// };

import { Injectable } from "@angular/core";
import { ActivatedRouteSnapshot,Router, CanActivate, GuardResult, MaybeAsync, RouterStateSnapshot } from "@angular/router";
import { Store } from "@ngrx/store";
import { selectUserType } from "../session/session.selectors";
import { firstValueFrom } from "rxjs";

@Injectable({
  providedIn: 'root', // used so that 
})
export class RoleGuard implements CanActivate {
  constructor(private router :Router, private store: Store){}

  async canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Promise<boolean> {
    try{
    const userType = await this.getUserTypeFromSession();
    const routeAllowedRole:string[] = route.data['roles']
    if(!userType || !routeAllowedRole.find(role => role === userType ) ){
      this.router.navigate(['404']);
      return false;
    }
    else return true;
    }catch(error){
      console.log(`Error while role determination ${error}`);
      this.router.navigate(['404']);
    }
  }
  async getUserTypeFromSession(): Promise<string> {
    try {
      const userType = await firstValueFrom(this.store.select(selectUserType));
      return userType;
    } catch (error) {
      console.error("Error fetching user type", error);
    }
  }
}