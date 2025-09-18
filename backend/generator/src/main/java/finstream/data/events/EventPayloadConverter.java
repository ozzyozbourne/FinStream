package finstream.data.events;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import io.quarkus.logging.Log;
import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;

@Converter(autoApply = true)
public class EventPayloadConverter  implements AttributeConverter<Payload.Event, String> {

    private final ObjectMapper objectMapper;

    public EventPayloadConverter(ObjectMapper objectMapper) {
        this.objectMapper = objectMapper;
    }

    @Override
    public String convertToDatabaseColumn(Payload.Event attribute) {
        try {
            return objectMapper.writeValueAsString(attribute);
        } catch (JsonProcessingException e) {
            Log.error("Error in Serializing", e);
            throw new RuntimeException(e);
        }
    }

    @Override
    public Payload.Event convertToEntityAttribute(String dbData) {
        try {
            return objectMapper.readValue(dbData, Payload.Event.class);
        } catch (JsonProcessingException e) {
            Log.error("Error in Deserializing", e);
            throw new RuntimeException(e);
        }
    }
}
