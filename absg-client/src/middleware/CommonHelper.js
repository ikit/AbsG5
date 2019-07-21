

export function parseAxiosResponse(response) {

    if (response.status !== 200) {
        // http error
        console.log('NETWORK ERROR', response);
        return null;
    }

    response = response.data;
    // Check Absg error
    if (!response.success) {
        // Absg server error
        console.log('ABSG ERROR', response);
        return null;
    }

    return response.data
}

