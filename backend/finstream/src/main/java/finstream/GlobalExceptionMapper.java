package finstream;

import io.quarkus.logging.Log;
import jakarta.persistence.PersistenceException;
import jakarta.ws.rs.WebApplicationException;
import jakarta.ws.rs.core.Response;
import jakarta.ws.rs.ext.ExceptionMapper;
import jakarta.ws.rs.ext.Provider;

final class GlobalExceptionMapper  {
    private GlobalExceptionMapper(){}

    record ErrorResponse(String error, String message) {}

    @Provider
    static class WebApplicationExceptionMapper implements ExceptionMapper<WebApplicationException>{

        @Override
        public Response toResponse(WebApplicationException exception) {
            Log.error("WebApplicationException", exception);
            return Response.status(exception.getResponse().getStatus())
                    .entity(new ErrorResponse("Request Error", exception.getMessage()))
                    .build();
        }
    }

    @Provider
    static class PersistenceExceptionMapper implements ExceptionMapper<PersistenceException> {

        @Override
        public Response toResponse(PersistenceException exception) {
            Log.error("Database error", exception);
            return Response.status(Response.Status.SERVICE_UNAVAILABLE)
                    .entity(new ErrorResponse("Database Error", "Service temporarily unavailable"))
                    .build();
        }
    }


    @Provider
    static class IllegalArgumentExceptionMapper implements ExceptionMapper<IllegalArgumentException> {
        @Override
        public Response toResponse(IllegalArgumentException exception) {
            Log.warn("Invalid argument", exception);
            return Response.status(Response.Status.BAD_REQUEST)
                    .entity(new ErrorResponse("Invalid Input", exception.getMessage()))
                    .build();
        }
    }

    @Provider
    static class GenericExceptionMapper implements ExceptionMapper<Exception> {
        @Override
        public Response toResponse(Exception exception) {
            Log.error("Unhandled exception", exception);
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                    .entity(new ErrorResponse("Internal Server Error", "An unexpected error occurred"))
                    .build();
        }
    }
}
