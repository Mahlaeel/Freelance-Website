import { inject } from "@angular/core";
import { CanActivateFn, Router } from "@angular/router";
import { FormServiceService } from "../services/form-service.service";
import { AuthService } from "../auth/auth.service";
import { map, switchMap } from "rxjs";

export const editService: CanActivateFn = (route, state) => {
    const formService = inject(FormServiceService);
    const authService = inject(AuthService);
    const router = inject(Router);
    const serviceId = route.params['id'];

    return authService.userData$.pipe(
        switchMap((userData) => {
            const sellerId = userData?.id;
            return formService.getService(serviceId).pipe(
                map(response => {
                    const service_userId = response.service[0].user_id;
                    if(service_userId == sellerId) {
                        return true;
                    }
                    router.navigate(['']);
                    return false;
                })
            )
        })
    )
}