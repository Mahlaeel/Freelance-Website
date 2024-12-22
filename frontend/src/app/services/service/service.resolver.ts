import { inject } from "@angular/core";
import { ActivatedRouteSnapshot, ResolveFn, RouterStateSnapshot } from "@angular/router";
import { Observable } from "rxjs";
import { FormServiceService } from "../form-service.service";

export const serviceResolver: ResolveFn<any> = (route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<any> => {
    const formService = inject(FormServiceService);
    const serviceId = route.paramMap.get('id');
    return formService.getService(serviceId);
}